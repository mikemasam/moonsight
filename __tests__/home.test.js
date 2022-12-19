import Doctor from '../doctor/index.js';

let doctor = await Doctor({ host: 'localhost:3003', socket: true });
//beforeAll(async () => {
//  doctor = await Doctor({ host: 'localhost:3003', socket: true });
//});
//afterAll(() => {
//  doctor.cleanup();
//});
it('GET /api', async () => {
  const res = await doctor.http().get(`http://${doctor.host}/api`);
  expect(res).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.data.message).toBe("");
  expect(res.data.success).toBe(true);
});
it('SOCKET /api', async () => {
  const res = await doctor.socket().emitAsync(':api', { hi: 1 });
  expect(res).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.message).toBe("");
  expect(res.success).toBe(true);
});
