Balanced.Customer = Balanced.Model.extend({
	bank_accounts: Balanced.Model.hasMany('Balanced.BankAccount', 'bank_accounts_uri'),

    verified_bank_accounts: function() {
        var bank_accounts = this.get('bank_accounts');

        return _.filter(bank_accounts, function(bank_account) {
            if(bank_account.get('verified')) {
                return bank_account;
            }
        });
    }.property('bank_accounts.@each.verified'),

    cards: Balanced.Model.hasMany('Balanced.Card', 'cards_uri')
});
