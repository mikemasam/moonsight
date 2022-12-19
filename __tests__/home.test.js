import boot from '../boot.js';
import HttpDoctor from '../doctor/http.js';
import SocketDoctor from '../doctor/socket.js';

let kernel = null;
beforeAll(async () => {
  kernel = await boot({ mocking: { socket: true, http: true }, autoBoot: false });
  await kernel.boot();
});
afterAll(() => {
  kernel.cleanup.dispose();
});
it('GET /api', async () => {
  const doctor = await HttpDoctor(kernel);
  expect(doctor).toBeTruthy();
  const res = await doctor.get(`http://${kernel.opts.host}/api`);
  expect(res).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.data.message).toBe("");
  expect(res.data.success).toBe(true);
});
it('SOCKET /api', async () => {
  const doctor = await SocketDoctor(kernel);
  expect(doctor).toBeTruthy();
  const res = await doctor.emitAsync(':api', { hi: 1 });
  expect(res).toBeTruthy();
  expect(res.status).toBe(200);
  expect(res.message).toBe("");
  expect(res.success).toBe(true);
});
