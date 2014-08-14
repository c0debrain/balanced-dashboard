Balanced.StartController = Balanced.Controller.extend({
	marketplace: function() {
		var secretApiKey = this.get("secretApiKey");
		var userMarketplace = Balanced.Auth.get("user.user_marketplaces").findBy("secret", secretApiKey);
		if (userMarketplace) {
			return userMarketplace.get("marketplace");
		}
	}.property("secretApiKey", "user.user_marketplaces"),

	secretApiKey: function() {
		return Ember.get("Balanced.NET.defaultApiKey");
	}.property("Balanced.NET.defaultApiKey"),

	actions: {
		goToDashboard: function() {
			var marketplace = this.get("marketplace");
			this.transitionToRoute('marketplace', marketplace);
		},
		goToDocumentation: function() {
			window.location = 'https://docs.balancedpayments.com';
		},
		goToSignUp: function() {
			this.transitionToRoute('sign_up');
		},
	}
});
