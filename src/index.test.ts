import {Main} from './index';
describe('Sample dummy test', () => {
  let service: Main;
  beforeEach(() => service = new Main());
  test('Calls the hello method to check the default output', async () => {
    expect(await service.think()).toBe('ok');
  });
});
