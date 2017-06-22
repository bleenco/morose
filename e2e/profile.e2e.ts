import { browser, by, element } from 'protractor';

describe('User profile', () => {
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

  it('should redirect to /profile/admin when logged in and click on first item in menu', () => {
    browser.get('/')
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).get(0).getText())
      .then(text => expect(text).toEqual('Profile'))
      .then(() => element.all(by.css('.nav-dropdown-item')).get(0).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/profile/admin'));
  });

  it('should see one organization on /profile/admin', () => {
    browser.get('/profile/admin')
      .then(() => expect(element.all(by.css('h1')).first().getText()).toContain('1 Organizations'));
  });

  it('should update fullname and email', () => {
    browser.get('/profile/admin')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element(by.css('.control-input-field[name="email"]')).sendKeys('admin@gmail.com'))
      .then(() => element(by.css('.control-input-field[name="name"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => element.all(by.css('li')).get(0).click())
      .then(() => expect(element.all(by.css('p')).first().getText()).toContain('admin'))
      .then(() => expect(element.all(by.css('p')).last().getText()).toContain('admin@gmail.com'));
  });

  it(`shouldn't change password because passwords doesn't match`, () => {
    browser.get('/profile/admin')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element(by.css('.control-input-field[name="oldpassword"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="newpassword1"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-input-field[name="newpassword2"]')).sendKeys('test12'))
      .then(() => element(by.css('.control-button')).click());
  });

  it(`shouldn't change password because old passwords is wrong`, () => {
    browser.get('/profile/admin')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element(by.css('.control-input-field[name="oldpassword"]')).sendKeys('admsafin'))
      .then(() => element(by.css('.control-input-field[name="newpassword1"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-input-field[name="newpassword2"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-button')).click());
  });

  it('should change password', () => {
    browser.get('/profile/admin')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element(by.css('.control-input-field[name="oldpassword"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="newpassword1"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-input-field[name="newpassword2"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => browser.get('/user/login'))
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('test123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.get('/profile/admin'))
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element(by.css('.control-input-field[name="oldpassword"]')).sendKeys('test123'))
      .then(() => element(by.css('.control-input-field[name="newpassword1"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="newpassword2"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => browser.get('/user/login'))
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/'))
      .then(() => {
        expect(element(by.css('.drop-menu-act')).getText()).toContain('Hello');
        expect(element(by.css('.drop-menu-act')).getText()).toContain('admin');
      });
  });

});
