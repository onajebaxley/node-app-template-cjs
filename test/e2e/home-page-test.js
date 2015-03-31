/* jshint expr:true */
/* global protractor, browser, element, by, xit */
var _config = require('../config');

describe('Home page:', function() {
    'use strict';
    var DEFAULT_TIMEOUT = 2000;
    var chai = require('chai');
    chai.use(require('chai-as-promised'));
    var expect = chai.expect;

    var Page = function() {
        this.load = function() {
            browser.get(_config.baseUrl + '/');
        };
    };
    var page;

    beforeEach(function() {
        page = new Page();
        page.load();
    });

    describe('Page layout:', function() {
        it('should have a page title of "node-app-template-cjs"', function() {
            expect(browser.getTitle()).to.eventually.equal('node-app-template-cjs');
        });

        it('should have all the basic page elements', function() {
            var nav = element.all(by.css('nav'));
            var form = element.all(by.css('div.form'));
            var message = element.all(by.css('div.message'));
            var button = element.all(by.buttonText('Shout Out!'));

            expect(nav.count()).to.eventually.equal(1);
            expect(form.count()).to.eventually.equal(1);
            expect(message.count()).to.eventually.equal(1);
            expect(button.count()).to.eventually.equal(1);
        });
    });

    describe('Navbar: ', function() {
        it('should have a brand and two navigation elements', function() {
            var brand = element.all(by.css('nav a.navbar-brand'));
            var items = element.all(by.css('nav ul.nav.navbar-nav li'));

            expect(brand.count()).to.eventually.equal(1);
            expect(items.count()).to.eventually.equal(2);
        });

        it('should have a brand value of "Hello World App"', function() {
            var brand = element.all(by.css('nav a.navbar-brand')).get(0);

            expect(brand.getText()).to.eventually.equal('Hello World App');
        });

        it('should have correct values to for the navigation links', function() {
            var items = element.all(by.css('nav ul.nav.navbar-nav li'));
            var item1 = items.get(0);
            var item2 = items.get(1);

            expect(item1.getText()).to.eventually.equal('home');
            expect(item2.getText()).to.eventually.equal('help');
        });

        // Temporarily commenting this out - seeing issues with firefox; chrome is fine.
        xit('should navigate to the help page when the home link is clicked', function() {
            var item = element.all(by.css('nav ul.nav.navbar-nav li')).get(0);

            item.click().then(function() {
                expect(browser.getLocationAbsUrl()).to.eventually.match(/#\/home$/);
            });
        });

        // Temporarily commenting this out - seeing issues with firefox; chrome is fine.
        xit('should navigate to the help page when the help link is clicked', function() {
            var item = element.all(by.css('nav ul.nav.navbar-nav li')).get(1);

            item.click().then(function() {
                expect(browser.getLocationAbsUrl()).to.eventually.match(/#\/help$/);
            });
        });
    });

    describe('Help view: ', function() {
        // Temporarily commenting this out - seeing issues with firefox; chrome is fine.
        xit('should show help documentation when clicked', function() {
            var item = element.all(by.css('nav ul.nav.navbar-nav li')).get(1);

            item.click().then(function() {
                var helpText = element.all(by.css('div.help'));
                expect(helpText.count()).to.eventually.equal(1);
                expect(helpText.get(0).getText()).to.eventually.equal('Help documentation');
            });
        });
    });

    describe('Home view: ', function() {
        describe('Greeting form:', function() {
            it('should have the greeting field as the first field', function() {
                var label = element.all(by.css('div.form > div.field > label')).get(0);
                var input = element.all(by.css('div.form > div.field > input')).get(0);

                expect(label.getText()).to.eventually.equal('Greeting');
                expect(input.isDisplayed()).to.eventually.be.true;
                expect(input.getAttribute('type')).to.eventually.equal('text');
                expect(input.getAttribute('value')).to.eventually.equal('Hello');
            });

            it('should have the salutation field as the second field', function() {
                var labels = element.all(by.css('div.form > div.field > label'));
                var inputs = element.all(by.css('div.form > div.field > input'));

                var label = labels.get(1);
                var mrInput = inputs.get(1);
                var msInput = inputs.get(2);

                expect(label.getText()).to.eventually.equal('Salutation');

                expect(mrInput.isDisplayed()).to.eventually.be.true;
                expect(mrInput.getAttribute('type')).to.eventually.equal('radio');
                expect(mrInput.getAttribute('value')).to.eventually.equal('Mr.');

                expect(msInput.isDisplayed()).to.eventually.be.true;
                expect(msInput.getAttribute('type')).to.eventually.equal('radio');
                expect(msInput.getAttribute('value')).to.eventually.equal('Ms.');
            });

            it('should have the name field as the third field', function() {
                var label = element.all(by.css('div.form > div.field > label')).get(2);
                var input = element.all(by.css('div.form > div.field > input')).get(3);

                expect(label.getText()).to.eventually.equal('Name');

                expect(input.isDisplayed()).to.eventually.be.true;
                expect(input.getAttribute('type')).to.eventually.equal('text');
                expect(input.getAttribute('value')).to.eventually.equal('World');
            });
        });

        describe('Greeting message:', function() {
            it('should all the components of the greeting message', function() {
                var fields = element.all(by.css('div.message > span'));

                expect(fields.get(0).getText()).to.eventually.equal('Hello');
                expect(fields.get(1).getText()).to.eventually.equal('Mr.');
                expect(fields.get(2).getText()).to.eventually.equal('World');
            });

            it('should show a fully formatted greeting message', function() {
                var message = element(by.css('div.message'));

                message.getText().then(function(text) {
                    text = text.trim();
                    expect(text).to.equal('Hello, Mr. World!');
                });
            });

        });

        describe('User interaction: ', function() {
            function _checkMessage(element, expectedText, callback) {
                element.getText().then(function(text) {
                    expect(text.trim()).to.equal(expectedText);
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }

            function _checkAlertDialog(expectedText, callback) {
                var alertDialog = browser.switchTo().alert();
                alertDialog.getText().then(function(text) {
                    expect(text.trim()).to.equal(expectedText);
                    alertDialog.accept();
                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }

            it('should update the message when the greeting is updated on the form.', function() {
                var input = element.all(by.css('div.form > div.field > input')).get(0);
                var message = element(by.css('div.message'));

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    input.clear().then(function() {
                        input.sendKeys('Bonjour').then(function() {
                            _checkMessage(message, 'Bonjour, Mr. World!');
                        });
                    });
                });
            });

            it('should update the message when a different salutation is chosen.', function() {
                var msInput = element.all(by.css('div.form > div.field > input')).get(2);
                var message = element(by.css('div.message'));

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    msInput.click().then(function() {
                        _checkMessage(message, 'Hello, Ms. World!');
                    });
                });
            });

            it('should update the message when the name is updated on the form.', function() {
                var input = element.all(by.css('div.form > div.field > input')).get(3);
                var message = element(by.css('div.message'));

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    input.clear().then(function() {
                        input.sendKeys('Earth').then(function() {
                            _checkMessage(message, 'Hello, Mr. Earth!');
                        });
                    });
                });
            });

            it('should show an alert message when the "Shout Out!" button is clicked', function() {
                var button = element.all(by.buttonText('Shout Out!')).get(0);
                button.click().then(function() {
                    _checkAlertDialog('Hello, Mr. World!');
                });
            });

            it('should show an updated alert message when the greeting is updated on the form.', function() {
                var input = element.all(by.css('div.form > div.field > input')).get(0);
                var message = element(by.css('div.message'));
                var button = element.all(by.buttonText('Shout Out!')).get(0);

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    input.clear().then(function() {
                        input.sendKeys('Bonjour').then(function() {
                            button.click().then(function() {
                                _checkAlertDialog('Bonjour, Mr. World!');
                            });
                        });
                    });
                });
            });

            it('should update the message when a different salutation is chosen.', function() {
                var msInput = element.all(by.css('div.form > div.field > input')).get(2);
                var message = element(by.css('div.message'));
                var button = element.all(by.buttonText('Shout Out!')).get(0);

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    msInput.click().then(function() {
                        button.click().then(function() {
                            _checkAlertDialog('Hello, Ms. World!');
                        });
                    });
                });
            });

            it('should update the message when the name is updated on the form.', function() {
                var input = element.all(by.css('div.form > div.field > input')).get(3);
                var message = element(by.css('div.message'));
                var button = element.all(by.buttonText('Shout Out!')).get(0);

                _checkMessage(message, 'Hello, Mr. World!', function() {
                    input.clear().then(function() {
                        input.sendKeys('Earth').then(function() {
                            button.click().then(function() {
                                _checkAlertDialog('Hello, Mr. Earth!');
                            });
                        });
                    });
                });
            });

        });

    });
});
