$(function() {
  var Tweet = Backbone.Model.extend({});

  var Tweets = Backbone.Collection.extend({
    model: Tweet,
    url: "http://search.twitter.com/search.json?callback=?",
    parse: function(data) {
      return data.results;
    },
    fetchFor: function(query) {
      this.fetch({
        data: { q: query }
      });
    }
  });

  var TweetsView = Backbone.View.extend({
    initialize: function(options) {
      var that = this;
      this.collection.on("reset", this.render, that);
    },
    template: _.template($('#tweet-template').html()),
    render:  function() {
      this.$('span').text("");
      var that = this;
      this.collection.each(function(tweet) {
        var html = that.template(tweet.toJSON());
        that.$('span').append(html);
      });
    }
  });

  var Quote = Backbone.Model.extend({
    url: "http://query.yahooapis.com/v1/public/yql",
    fetch: function(options) {
      options || (options = {});
      options.data || (options.data = {});
      options.data['q'] = "select * from xml where url='www.google.com/ig/api?stock="+this.ticker+"'";
      options.data['diagnostics'] = true;
      options.data['format'] = "json";
      return Backbone.Model.prototype.fetch.call(this, options);
    },
    setTicker: function(ticker) {
      this.set({company : undefined}, { silent: true});
      this.ticker = ticker;
    },
    getCompany: function() {
      var attribute = this.get("company");
      var company = "";
      if(attribute && attribute.data) {
        company = attribute.data;
      }
      return company;
    },
    parse: function(data) {
      return data.query.results.xml_api_reply.finance;
    }
  });

  var QuoteView = Backbone.View.extend({
    events: {
      "submit form": "onSubmit"
    },
    initialize: function(options) {
      var that = this;
      this.model.on("change", options.onQuoteLoaded, this.model);
    },
    onSubmit: function(e) {
      e.preventDefault();
      this.model.setTicker(this.$('input[type="text"]').val());
      this.model.fetch({ error: this.options.onQuoteLoaded });
      this.$('input[type="text"]').val("");
      console.log("onSubmit");
    }
  });

  var tweets = new Tweets();
  var tweetsView = new TweetsView({ el: $('#tweets'), collection: tweets});
  var quote = new Quote();
  var quoteView = new QuoteView({ 
    el: $('#new-quote'), 
    model: quote, 
    onQuoteLoaded: function(loaded) {
      console.log(loaded);
      if(loaded.getCompany().length > 0) {
        tweets.fetchFor(loaded.getCompany());
      } else {
        alert('This is not a valid ticker');
      }
    }
  });

});
