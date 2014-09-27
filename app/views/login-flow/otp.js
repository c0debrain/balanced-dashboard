import LoginView from "../login";

var OtpView = LoginView.extend({
	templateName: 'login-flow/otp',
	pageTitle: 'Two-factor authentication',

	afterFormLink: function() {
		return {
			linkTo: 'login',
			linkText: 'Back to sign in'
		};
	}.property(),
});

export default OtpView;
