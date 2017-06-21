import { browser, by, element } from 'protractor';

describe('User Login', () => {
  beforeEach(() => {
    browser.get('/');
  });

  it('should login with correct username and password', () => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/'))
      .then(() => {
        expect(element(by.css('.drop-menu-act')).getText()).toContain('Hello');
        expect(element(by.css('.drop-menu-act')).getText()).toContain('admin');
      })
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'));
  });

  it('should redirect to / if already logged in and want to access /user/login', () => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/'))
      .then(() => browser.get('/user/login'))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/'))
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'));
  });

  it('shoud be able to logout successfully after valid login', () => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/'))
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'));
  });

  it('shoud not be able to login with wrong credentials', () => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin123'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'))
      .then(() => {
        let el = element(by.css('.notification'));
        expect(el.getText()).toContain('Authentication failed');
      })
      .then(() => {
        let el = element(by.css('.nav-right .nav-item'));
        expect(el.getText()).toContain('Login');
      });
  });

  it('shoud redirect to /user/login if not logged in and want to access /profile/admin', () => {
    browser.get('/profile/admin')
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'));
  });

  it('shoud redirect to /user/login if not logged in and want to access /org/bleenco', () => {
    browser.get('/org/bleenco')
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/user/login'));
  });
});
