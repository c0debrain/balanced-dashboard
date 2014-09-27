import startApp from '../helpers/start-app';
import Testing from "../helpers/testing";

import checkElements from "../helpers/check-elements";
import createObjects from "../helpers/create-objects";
import helpers from "../helpers/helpers";

import Models from "../helpers/models";

var App, Adapter;

module('Integration - Marketplace Settings Guest', {
	setup: function() {
		App = startApp();
		Adapter = App.__container__.lookup("adapter:main");
		Testing.setupMarketplace();
		Testing.createBankAccount();
		Testing.createCard();

		sinon.stub(Ember.Logger, "error");
	},
	teardown: function() {
		Testing.restoreMethods(
			Models.APIKey.prototype.save,
			Adapter.create,
			Adapter['delete'],
			Adapter.update,
			balanced.bankAccount.create,
			balanced.card.create,
			Ember.Logger.error
		);
		Ember.run(App, 'destroy');
	}
});

test('can visit page', function() {
	visit(Testing.SETTINGS_ROUTE)
		.checkPageTitle("Settings")
		.checkElements({
			'#user-menu > a.dropdown-toggle.gravatar': "Guest user",
			'.notification-center-message': 1
		});
});

test('can update marketplace info', function() {
	visit(Testing.SETTINGS_ROUTE)
		.then(function() {
			Ember.run(function() {
				var model = BalancedApp.__container__.lookup('controller:marketplaceSettings').get('model');
				model.set('production', true);
			});
		})
		.click(".marketplace-info .edit-model-link")
		.fillIn('#edit-marketplace-info .modal-body input[name=name]', 'Test boogie boo')
		.click('#edit-marketplace-info .modal-footer button[name=modal-submit]')
		.checkElements({
			'.key-value-display:first dd:contains(Test boogie boo)': 1
		});
});

test('updating marketplace info only submits once despite multiple clicks', function() {
	var stub = sinon.stub(Adapter, "update");

	visit(Testing.SETTINGS_ROUTE)
		.then(function() {
			Ember.run(function() {
				var model = BalancedApp.__container__.lookup('controller:marketplaceSettings').get('model');
				model.set('production', true);
			});
		})
		.click(".key-value-display:first .edit-model-link")
		.fillIn('#edit-marketplace-info .modal-body input[name=name]', 'Test')
		.click('#edit-marketplace-info .modal-footer button[name=modal-submit]')
		.click('#edit-marketplace-info .modal-footer button[name=modal-submit]')
		.click('#edit-marketplace-info .modal-footer button[name=modal-submit]')
		.then(function() {
			ok(stub.calledOnce);
		});
});

test('can update owner info', function() {
	var stub = sinon.stub(Adapter, "update");

	visit(Testing.SETTINGS_ROUTE)
		.then(function() {
			var model = BalancedApp.__container__.lookup('controller:marketplaceSettings').get('model');
			Ember.run(function() {
				model.set('owner_customer', Models.Customer.create());
				model.set('production', true);
			});
		})
		.click('.owner-info a.icon-edit')
		.click('#edit-customer-info a.more-info')
		.fillForm("#edit-customer-info", {
			name: 'TEST',
			email: 'TEST@example.com',
			business_name: 'TEST',
			ein: '1234',
			line1: '600 William St',
			line2: 'Apt 400',
			city: 'Oakland',
			state: 'CA',
			country_code: 'US',
			postal_code: '12345',
			phone: '1231231234',
			dob_month: '12',
			dob_year: '1924',
			ssn_last4: '1234',
		})
		.click('#edit-customer-info .modal-footer button[name=modal-submit]')
		.then(function() {
			ok(stub.calledOnce);
			ok(stub.calledWith(Models.Customer));
			equal(stub.getCall(0).args[2].name, "TEST");
			equal(stub.getCall(0).args[2].email, "TEST@example.com");
			equal(stub.getCall(0).args[2].business_name, "TEST");
			equal(stub.getCall(0).args[2].ein, "1234");
			equal(stub.getCall(0).args[2].address.line1, "600 William St");
			equal(stub.getCall(0).args[2].address.line2, "Apt 400");
			equal(stub.getCall(0).args[2].address.city, "Oakland");
			equal(stub.getCall(0).args[2].address.state, "CA");
			equal(stub.getCall(0).args[2].address.country_code, "US");
			equal(stub.getCall(0).args[2].address.postal_code, "12345");
			equal(stub.getCall(0).args[2].phone, "1231231234");
			equal(stub.getCall(0).args[2].dob_month, "12");
			equal(stub.getCall(0).args[2].dob_year, "1924");
			equal(stub.getCall(0).args[2].ssn_last4, "1234");
		});
});

test('can create checking accounts', function() {
	var tokenizingStub = sinon.stub(balanced.bankAccount, "create");
	tokenizingStub.callsArgWith(1, {
		status: 201,
		bank_accounts: [{
			href: '/bank_accounts/' + Testing.BANK_ACCOUNT_ID
		}]
	});

	visit(Testing.SETTINGS_ROUTE)
		.click('.main-panel a:contains(Add a bank account)')
		.fillForm({
			name: "TEST",
			account_number: "123",
			routing_number: "123123123",
			account_type: "checking",
		})
		.click('#add-bank-account .modal-footer button[name=modal-submit]')
		.then(function() {
			ok(tokenizingStub.calledOnce);
			ok(tokenizingStub.calledWith({
				account_type: "checking",
				name: "TEST",
				account_number: "123",
				routing_number: "123123123"
			}));
		});
});

test('can fail at creating bank accounts', function() {
	var tokenizingStub = sinon.stub(balanced.bankAccount, "create");
	tokenizingStub.callsArgWith(1, {
		status: 400,
		errors: [{
			"status": "Bad Request",
			"category_code": "request",
			"additional": null,
			"status_code": 400,
			"description": "Invalid field [routing_number] - \"321171184abc\" must have length <= 9 Your request id is OHM4b90b4d8524611e3b62e02a1fe52a36c.",
			"category_type": "request",
			"_uris": {},
			"request_id": "OHM4b90b4d8524611e3b62e02a1fe52a36c",
			"extras": {
				"routing_number": "\"321171184abc\" must have length <= 9"
			}
		}]
	});

	visit(Testing.SETTINGS_ROUTE)
		.click('.main-panel a:contains(Add a bank account)')
		.fillForm({
			name: "TEST",
			account_number: "123",
			routing_number: "123123123abc",
			account_type: "checking"
		})
		.click('#add-bank-account .modal-footer button[name=modal-submit]')
		.then(function() {
			ok(tokenizingStub.calledOnce);
			ok(tokenizingStub.calledWith({
				account_type: "checking",
				name: "TEST",
				account_number: "123",
				routing_number: "123123123abc"
			}));

			ok($('#add-bank-account .modal-body input[name=routing_number]').closest('.control-group').hasClass('error'), 'Validation errors being reported');
			equal($('#add-bank-account .modal-body input[name=routing_number]').next().text().trim(), '"321171184abc" must have length <= 9');
		});
});

test('can create savings accounts', function() {
	var tokenizingStub = sinon.stub(balanced.bankAccount, "create");

	visit(Testing.SETTINGS_ROUTE)
		.click(".main-panel a:contains(Add a bank account)")
		.fillForm({
			name: "TEST",
			account_number: "123",
			routing_number: "123123123",
			account_type: "savings",
		})
		.click('#add-bank-account .modal-footer button[name=modal-submit]')
		.then(function() {
			// test balanced.js
			ok(tokenizingStub.calledOnce);
			ok(tokenizingStub.calledWith({
				account_type: "savings",
				name: "TEST",
				account_number: "123",
				routing_number: "123123123"
			}));
		});
});

test('can create cards', function() {
	var tokenizingStub = sinon.stub(balanced.card, "create");
	tokenizingStub.callsArgWith(1, {
		status: 201,
		cards: [{
			href: '/cards/' + Testing.CARD_ID
		}]
	});

	visit(Testing.SETTINGS_ROUTE)
		.click('.main-panel a:contains(Add a card)')
		.fillForm("#add-card", {
			name: "TEST",
			number: "1234123412341234",
			cvv: "123",
			expiration_year: "2020",
			expiration_month: "1"
		})
		.click('#add-card .modal-footer button[name=modal-submit]')
		.then(function() {
			ok(tokenizingStub.calledWith(sinon.match({
				name: "TEST",
				number: "1234123412341234",
				cvv: "123",
				expiration_month: 1,
				expiration_year: 2020,
				address: {}
			})));
			ok(tokenizingStub.calledOnce);
		});
});
