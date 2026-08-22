import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.all_models import User

@pytest_asyncio.fixture(scope="module")
async def client():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient):
    response = await client.post(
        "/api/auth/login",
        json={"email": "admin@dayflow.io", "password": "Admin@1234"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "SUPER_ADMIN"

@pytest.mark.asyncio
async def test_employee_login(client: AsyncClient):
    response = await client.post(
        "/api/auth/login",
        json={"email": "john.doe@dayflow.io", "password": "Employee@1234"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "EMPLOYEE"

@pytest.mark.asyncio
async def test_employee_cannot_access_admin_endpoints(client: AsyncClient):
    # Login as Employee
    login_res = await client.post(
        "/api/auth/login",
        json={"email": "john.doe@dayflow.io", "password": "Employee@1234"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access admin employees list
    admin_res = await client.get("/api/employees", headers=headers)
    assert admin_res.status_code == 403

@pytest.mark.asyncio
async def test_employee_checkin_checkout_flow(client: AsyncClient):
    login_res = await client.post(
        "/api/auth/login",
        json={"email": "sarah.connor@dayflow.io", "password": "Employee@1234"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Check in (if not already checked in today)
    ci_res = await client.post("/api/attendance/check-in", json={"source": "WEB_TEST"}, headers=headers)
    assert ci_res.status_code in [200, 400] # 400 if already checked in from seed

@pytest.mark.asyncio
async def test_ai_copilot_permissions(client: AsyncClient):
    login_res = await client.post(
        "/api/auth/login",
        json={"email": "john.doe@dayflow.io", "password": "Employee@1234"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Ask for leave balance
    ai_res = await client.post("/api/ai/chat", json={"message": "What is my leave balance?"}, headers=headers)
    assert ai_res.status_code == 200
    assert "Paid Leave" in ai_res.json()["reply"] or "available" in ai_res.json()["reply"]

    # Ask restricted HR question as Employee
    ai_hr_res = await client.post("/api/ai/chat", json={"message": "Who requested leave?"}, headers=headers)
    assert ai_hr_res.status_code == 200
    assert "Permission Denied" in ai_hr_res.json()["reply"]
