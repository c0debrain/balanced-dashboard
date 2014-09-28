import Ember from "ember";
import { test } from 'ember-qunit';
import startApp from '../helpers/start-app';
import fixturesAdapter from "../helpers/fixtures-adapter";
import sinonRestore from "../helpers/sinon-restore";

import Testing from "../helpers/testing";
import Models from "../helpers/models";
import helpers from "../helpers/helpers";
import checkElements from "../helpers/check-elements";

var App, Auth, Adapter = fixturesAdapter;

module('Integration - ChangeEmail', {
	setup: function() {
		App = startApp({
			ADAPTER: fixturesAdapter
		});
		Auth = App.__container__.lookup("auth:main");
	},
	teardown: function() {
		sinonRestore(Auth.request, Adapter.update);
		Ember.run(App, "destroy");
	},
});

test('clicking change email from header menu brings up modal', function() {
	visit(Testing.MARKETPLACES_ROUTE)
		.click("#user-menu .change-email a")
		.check("#change-email-modal", 1);
});

test('change email form submits', function() {
	var stub = sinon.stub(Adapter, "update");
	var USER_EMAIL = 'foo+1@bar.com';

	stub.callsArgWith(3, {
		"id": null,
		"admin": false,
		"email_address": USER_EMAIL
	});

	visit(Testing.MARKETPLACES_ROUTE)
		.click("#user-menu .change-email a")
		.checkValue("#change-email-modal input[name=email_address]", Testing.FIXTURE_USER_EMAIL, 'Email is filled in')
		.fillForm('#change-email-modal', {
			email_address: USER_EMAIL,
			existing_password: '123456',
		})
		.click('#change-email-modal button[name=modal-submit]')
		.check("#change-email-modal", 0)
		.then(function() {
			ok(stub.calledOnce);
			var args = stub.args[0];
			equal(args[0], BalancedApp.__container__.lookupFactory("model:user"), "User model");
			equal(args[1], Testing.FIXTURE_USER_ROUTE);
			equal(args[2].email, USER_EMAIL);
			equal(args[2].existing_password, "123456");
		});
});

test('change email form errors if no email', function() {
	var stub = sinon.stub(Adapter, "update");

	stub.callsArgWith(3, {
		"id": null,
		"admin": false,
		"email_address": "foo+1@bar.com",
	});

	visit(Testing.MARKETPLACES_ROUTE)
		.click("#user-menu .change-email a")
		.fillForm('#change-email-modal form', {
			email_address: '',
			existing_password: '123456'
		}, {
			click: 'button[name=modal-submit]'
		})
		.click("#change-email-modal form button[name=modal-submit]")
		.checkElements({
			"#change-email-modal": 1,
			"#change-email-modal .alert.alert-error": "can't be blank, is invalid, is too short (minimum 6 characters)"
		})
		.then(function() {
			equal(stub.callCount, 0);
		});
});


test('change email errors if no existing password', function() {
	var stub = sinon.stub(Adapter, "update");
	var USER_EMAIL = 'foo+1@bar.com';

	stub.callsArgWith(3, {
		"id": null,
		"admin": false,
		"email_address": USER_EMAIL
	});

	visit(Testing.MARKETPLACES_ROUTE)
		.click("#user-menu .change-email a")
		.fillForm('#change-email-modal form', {
			email_address: USER_EMAIL,
		}, {
			click: 'button[name=modal-submit]'
		})
		.checkElements({
			"#change-email-modal": 1,
			"#change-email-modal .alert.alert-error": "can't be blank",
		})
		.then(function() {
			equal(stub.callCount, 0);
		});
});
