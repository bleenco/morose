import { browser, by, element } from 'protractor';

describe('Users', () => {
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

  it('should redirect to /users when logged in and click on second item in menu', () => {
    browser.get('/')
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).get(1).getText())
      .then(text => expect(text).toEqual('Users'))
      .then(() => element.all(by.css('.nav-dropdown-item')).get(1).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/users'));
  });

  it('should see one user on /users', () => {
    browser.get('/users')
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Users'));
  });

  it('should click on second tab and see add user form', () => {
    browser.get('/users')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element(by.css('.control-button')).getText())
      .then(text => expect(text).toContain('Add User'));
  });

  it('should add new user', () => {
    browser.get('/users')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="fullname"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="email"]')).sendKeys('test@test'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => element.all(by.css('li')).get(0).click())
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Users'));
  });

  it('should cancel removeing user test', () => {
    browser.get('/users')
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().dismiss())
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Users'));
  });

  it('should remove user test', () => {
    browser.get('/users')
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().accept())
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Users'))
      .then(() => expect(element(by.css('.table')).getText()).toContain('admin'));
  });
});
