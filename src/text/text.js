'use strict';
const sentence_parser = require('./sentence_parser.js');
const Sentence = require('../sentence/sentence.js');
const Question = require('../sentence/question/question.js');
const Statement = require('../sentence/statement/statement.js');
const fns = require('../fns.js');

//a text object is a series of sentences, along with the generic methods for transforming them
class Text {
  constructor(str, options) {
    options = options || {};
    const the = this;
    this.raw_text = str || '';
    //build-up sentence/statement methods
    this.sentences = sentence_parser(str).map(function(s) {
      let last_char = s.slice(-1);
      if (last_char === '?') {
        return new Question(s, options);
      } else if (last_char === '.' || last_char === '!') {
        return new Statement(s, options);
      }
      return new Sentence(s, options);
    });

    this.contractions = {
      // he'd -> he would
      expand: function() {
        return the.sentences.map(function(s) {
          return s.contractions.expand();
        });
      },
      // he would -> he'd
      contract: function() {
        return the.sentences.map(function(s) {
          return s.contractions.contract();
        });
      }
    };
  }


  //map over sentence methods
  text() {
    const arr = this.sentences.map(function(s) {
      return s.text();
    });
    return fns.flatten(arr).join('');
  }
  normalized() {
    const arr = this.sentences.map(function(s) {
      return s.normalized();
    });
    return fns.flatten(arr).join(' ');
  }

  //further 'lemmatisation/inflection'
  root() {
    const arr = this.sentences.map(function(s) {
      return s.root();
    });
    return fns.flatten(arr).join(' ');
  }

  terms() {
    const arr = this.sentences.map(function(s) {
      return s.terms;
    });
    return fns.flatten(arr);
  }
  tags() {
    return this.sentences.map(function(s) {
      return s.tags();
    });
  }

  //a regex-like lookup for a sentence.
  // returns an array of terms
  match(str, options) {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].match(str, options));
    }
    return arr;
  }
  replace(str, replacement, options) {
    for(let i = 0; i < this.sentences.length; i++) {
      this.sentences[i].replace(str, replacement, options);
    }
    return this;
  }

  //transformations
  to_past() {
    return this.sentences.map(function(s) {
      return s.to_past();
    });
  }
  to_present() {
    return this.sentences.map(function(s) {
      return s.to_present();
    });
  }
  to_future() {
    return this.sentences.map(function(s) {
      return s.to_future();
    });
  }
  negate() {
    return this.sentences.map(function(s) {
      return s.negate();
    });
  }
  //mining
  people() {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].people());
    }
    return arr;
  }
  places() {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].places());
    }
    return arr;
  }
  organizations() {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].organizations());
    }
    return arr;
  }
  dates() {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].dates());
    }
    return arr;
  }
  values() {
    let arr = [];
    for(let i = 0; i < this.sentences.length; i++) {
      arr = arr.concat(this.sentences[i].values());
    }
    return arr;
  }
  //more generic named-entity recognition
  spot() {
    let obj = {};
    for(let i = 0; i < this.sentences.length; i++) {
      let terms = this.sentences[i].spot();
      for(let o = 0; o < terms.length; o++) {
        obj[terms[o][0]] = obj[terms[o][0]] || [];
        obj[terms[o][0]].push(terms[o]);
      }
    }
    return obj;
  }
}
Text.fn = Text.prototype;

module.exports = Text;
