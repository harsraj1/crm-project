const apiUrl = process.env.API_URL || 'http://localhost:5000/api';
const runId = Date.now();
const credentials = {
  name: 'Phase One Smoke User',
  email: `phase-one-${runId}@example.com`,
  password: 'SmokeTest123!'
};

let token;
let leadId;
let customerId;

const request = async (path, options = {}) => {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const body = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
};

const run = async () => {
  const health = await request('/health');
  if (health.status !== 'ok') throw new Error('API health check is not ready');

  const registered = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  token = registered.token;
  if (registered.user.role !== 'sales') throw new Error('Public registration did not create a sales user');

  const loggedIn = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: credentials.email, password: credentials.password })
  });
  token = loggedIn.token;
  const profile = await request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name: 'Phase One Verified User', email: credentials.email })
  });
  if (profile.user.name !== 'Phase One Verified User') throw new Error('Profile update did not persist');

  const lead = await request('/leads', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Lead',
      email: `lead-${runId}@example.com`,
      company: 'Smoke Company',
      status: 'new',
      value: 1000,
      source: 'website'
    })
  });
  leadId = lead.data._id;
  await request(`/leads/${leadId}`);
  const updatedLead = await request(`/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'qualified', value: 2500 })
  });
  if (updatedLead.data.status !== 'qualified') throw new Error('Lead update did not persist');
  await request('/leads?page=1&limit=20&sort=-createdAt');

  const customer = await request('/customers', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'Smoke',
      lastName: 'Customer',
      email: `customer-${runId}@example.com`,
      company: 'Smoke Company',
      status: 'prospect'
    })
  });
  customerId = customer.data._id;
  await request(`/customers/${customerId}`);
  const updatedCustomer = await request(`/customers/${customerId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'active', lifetimeValue: 5000 })
  });
  if (updatedCustomer.data.status !== 'active') throw new Error('Customer update did not persist');
  await request('/customers?page=1&limit=20&sort=-createdAt');

  await request(`/leads/${leadId}`, { method: 'DELETE' });
  leadId = null;
  await request(`/customers/${customerId}`, { method: 'DELETE' });
  customerId = null;

  console.log('✅ Phase 1 smoke test passed: health, register, login, profile update, lead CRUD, customer CRUD');
};

run()
  .catch(error => {
    console.error(`❌ Smoke test failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (leadId) await request(`/leads/${leadId}`, { method: 'DELETE' }).catch(() => {});
    if (customerId) await request(`/customers/${customerId}`, { method: 'DELETE' }).catch(() => {});
  });
