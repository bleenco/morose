import { browser, by, element } from 'protractor';

describe('Organization', () => {
  beforeAll(() => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.get('/users'))
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="fullname"]')).sendKeys('test'))
      .then(() => element(by.css('.control-input-field[name="email"]')).sendKeys('test@test'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => element.all(by.css('li')).get(0).click())
      .then(() => expect(element(by.css('h1')).getText()).toContain('2 Users'))
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click());
  });

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

  afterAll(() => {
    browser.get('/user/login')
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('admin'))
      .then(() => element(by.css('.control-input-field[name="password"]')).sendKeys('admin'))
      .then(() => element(by.css('.login-button')).click())
      .then(() => browser.get('/users'))
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().accept())
      .then(() => expect(element(by.css('h1')).getText()).toContain('1 Users'))
      .then(() => expect(element(by.css('.table')).getText()).toContain('admin'))
      .then(() => element(by.css('.drop-menu-act')).click())
      .then(() => element.all(by.css('.nav-dropdown-item')).last().click());
  });

  it('should redirect to /org/bleenco when logged and click on first item in table', () => {
    browser.get('/org')
      .then(() => element(by.css('td > a')).click())
      .then(() => element(by.css('h1')).getText())
      .then(text => expect(text).toContain('@bleenco'))
      .then(() => browser.getCurrentUrl())
      .then(url => expect(url).toEqual('http://localhost:10000/org/bleenco'));
  });

  it('should see one team, one member and zero packages on /org/bleenco', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('h1')).get(1).getText())
      .then(text => expect(text).toContain('Company has no Packages'))
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element.all(by.css('h1')).get(1).getText())
      .then(text => expect(text).toContain('1 Teams'))
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element.all(by.css('h1')).get(1).getText())
      .then(text => expect(text).toContain('1 Members'));
  });

  it('should add team', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element(by.css('.control-input-field[name="name"]')).sendKeys('test'))
      .then(() => element(by.css('.control-button')).click())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Teams'));
  });

  it('should see two teams on /org/bleenco', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Teams'));
  });

  it('should cancel removeing team test', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().dismiss())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Teams'));
  });

  it('should remove team test', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(1).click())
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().accept())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('1 Teams'));
  });

  it('should add user', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element(by.css('.control-input-field[name="username"]')).sendKeys('test'))
      .then(() => element(by.cssContainingText('option', 'Member')).click())
      .then(() => element(by.css('.control-button')).click())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Members'));
  });

  it('should see two users on /org/bleenco', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Members'));
  });

  it('should cancel removeing user test', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().dismiss())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('2 Members'));
  });

  it('should remove user test', () => {
    browser.get('/org/bleenco')
      .then(() => element.all(by.css('li')).get(2).click())
      .then(() => element.all(by.css('.typcn-delete')).get(1).click())
      .then(() => browser.switchTo().alert().accept())
      .then(() => expect(element.all(by.css('h1')).get(1).getText()).toContain('1 Members'));
  });
});
