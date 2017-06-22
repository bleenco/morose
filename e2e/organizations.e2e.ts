import { browser, by, element } from 'protractor';

describe('Organizations', () => {
  beforeEach(() => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click());
  });

  afterEach(() => {
    element(by.css('.drop-menu-act')).click()
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click());
  });

  it('should redirect to /org when logged in and click on third item in menu', () => {
    browser.get('/')
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).get(2).getText())
      .then(text => expect(text).toEqual('Organizations'))
      .then(() => element.all(by.css('.nav-dropdown-item')).get(2).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/org'));
  });

  it('should see one organization on /org', () => {
    browser.get('/org')
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Organizations'));
  });

  it(`shouldn't add organization, because name is empty`, () => {
    browser.get('/org')
      .then(() => element(by.css('.control-button')).click())
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Organizations'));
  });

  it('should add organization', () => {
    browser.get('/org')
      .then(() => element(by.css('.control-input-field[name="name"]')).sendKeys('test'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Organizations'));
  });

  it('should see two organization on /org', () => {
    browser.get('/org')
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Organizations'));
  });

  it('should cancel removeing organization test', () => {
    browser.get('/org')
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().dismiss())
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Organizations'));
  });

  it('should remove organization test', () => {
    browser.get('/org')
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().accept())
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Organizations'))
      .then(() => expect(element(by.css('.table')).getText()).toContain('bleenco'));
  });
});
