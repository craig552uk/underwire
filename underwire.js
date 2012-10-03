//
//  Underwire JS
//  ============
//
//  Provides you with much needed support.
//
//  Inspired by Prototype.js
//  Incorporating code and ideas from https://github.com/stewdio/skip
//
//  Author:  Craig Russell
//  Web:     craig-russell.co.uk
//  Email:   craig@craig-russell.co.uk
//  Twitter: @craig552uk
//  GitHub:  github.com/craig552uk
//
//
//  Copyright (C) 2012, Craig Russell.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the "Software"),
//  to deal in the Software without restriction, including without limitation
//  the rights to use, copy, modify, merge, publish, distribute, sublicense,
//  and/or sell copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
//  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
//  DEALINGS IN THE SOFTWARE.

(function(window, undefined){

  // Handy numbers
  E       = Math.E
  PI      = Math.PI
  TAU     = Math.PI * 2
  SQRT2   = Math.SQRT2
  SQRT1_2 = Math.SQRT1_2
  LN      = Math.LN2
  LN10    = Math.LN10
  LOG2E   = Math.LOG2E
  LOG10E  = Math.LOG10E

  // Times and Dates
  SECOND  = 1000;
  MINUTE  = SECOND *  60;
  HOUR    = MINUTE *  60;
  DAY     = HOUR   *  24;
  WEEK    = DAY    *   7;
  MONTH   = DAY    *  30.4368499;
  YEAR    = DAY    * 365.242199;
  DECADE  = YEAR   *  10;
  CENTURY = YEAR   * 100;
  now     = function(){ return +Date.now() }


  //
  // Type detection
  //
  window.is = {
    bool:   function(b){ return typeof b === 'boolean'; },
    def:    function(o){ return !(typeof o === 'undefined'); },
    number: function(n){ return typeof n === 'number' && isFinite(n); },
    string: function(s){ return typeof s === 'string'; },
    fn:     function(f){ return typeof f === 'function'; },
    array:  function(a){
      if (a){ return is.number(a.length) && is.fn(a.splice); }
      return false;
    }
  };


  // Private
  // Augments a data type with new functions
  // type: Existing data type
  // data: Object of functions
  var _augment = function( type, data ){
    for ( var key in data ) {
      type.prototype[key] = type.prototype[key] || data[key];
    }
  }


  _augment(Array, {

    first: function(){
      return this[0];
    },

    last: function(){
      return this[this.length -1];
    },

    max: function(){
      return Math.max.apply(null, this);
    },

    min: function(){
      return Math.min.apply(null, this);
    },

    sum: function(){
      var n=0;
      this.each(function(e){
        n += e;
      });
      return n;
    },

    mean: function(){
      return this.sum()/this.length;
    },

    variance: function(){
      var n = 0, mean = this.mean();
      this.each(function(e){
        n += (e-mean).pow(2)
      });
      return n / this.length;
    },

    stdDev: function(){
      return Math.sqrt(this.variance());
    },

    swap: function(i,j){
      var k = this[i];
      this[i] = this[j];
      this[j] = k;
      return this;
    },

    // http://en.wikipedia.org/wiki/Fisher-Yates_shuffle
    shuffle: function(){
      for(var i=this.length-1; i>0; i--){
        j = i.random().floor();
        this.swap(i,j);
      }
      return this
    },

    each: function(fn){
      for(var i=0; i<this.length; i++){
        fn.call(this, this[i], i);
      }
      return this;
    },

    map: function(fn){
      var a =[]
      this.each(function(e, i){
        a[i] = fn.call(this, e, i);
      });
      return a;
    },

    reverse: function(){
      return this.map(function(e,i){
        return this[this.length-i-1];
      })
    }
  });


  _augment(Number, {

    random: function(){
      return Math.random() * this;
    },

    abs: function(){
      return Math.abs(this);
    },

    floor: function(){
      return Math.floor(this);
    },

    ceil: function(){
      return Math.ceil(this);
    },

    isBetween: function(a, b){
      var min = Math.min(a, b),
          max = Math.max(a, b);
      return (min<=this && this<=max) ? true : false;
    },

    normalise: function(a, b){
      if(a==b){ return 1.0; }
      return (this-a) / (b-a);
    },

    scale: function(a, b){
      var phase = this.normalise(a[0], a[1])
      if (b[0] == b[1]) return b[1];
      return b[0] + phase * (b[1]-b[0])
    },

    pow: function(p){
      return Math.pow(this, p);
    },

    round: function(dp){
      dp = dp || 0;
      return Math.round(this*(10).pow(dp)) / (10).pow(dp);
    },

    times: function(fn){
      for(var i=0; i<this; i++){
        fn.call(this, i);
      }
      return this;
    },

    //
    // ((2).years() + (3).days() + (5).hours()).inPast().toDate()
    //
    seconds:   function(){ return this * SECOND },
    minutes:   function(){ return this * MINUTE },
    hours:     function(){ return this * HOUR },
    days:      function(){ return this * DAY },
    weeks:     function(){ return this * WEEK },
    months:    function(){ return this * MONTH },
    years:     function(){ return this * YEAR },
    decades:   function(){ return this * DECADE },
    centuries: function(){ return this * CENTURY },
    inPast:    function(){ return +Date.now() - this },
    inFuture:  function(){ return +Date.now() + this },
    toDate:    function(){ return new Date(this) }
  });


  _augment(Date, {

    //
    // Date.parse("2012/02/13 10:04:59").toDate().toFuzzyDateString()
    //
    toFuzzyDateString: function(){
      var now  = +Date.now(), then = this.getTime();
      if (now > then){
        var diff = now - then, qualifier = " ago";
      }else{
        var diff = then - now, qualifier = " ahead";
      }

      if (isNaN(diff))     { return ""; }
      if (diff < MINUTE)   { return Math.floor(diff / SECOND)+" seconds"+qualifier; }
      if (diff < MINUTE*2) { return "1 second"+qualifier; }
      if (diff < HOUR)     { return Math.floor(diff / MINUTE)+" minutes"+qualifier; }
      if (diff < HOUR*2)   { return "1 minute"+qualifier; }
      if (diff < DAY)      { return Math.floor(diff / HOUR)+" hours"+qualifier; }
      if (diff < DAY*2)    { return "1 hour"+qualifier; }
      if (diff < MONTH)    { return Math.floor(diff / DAY)+" days"+qualifier; }
      if (diff < MONTH*2)  { return "1 day"+qualifier; }
      if (diff < YEAR)     { return Math.floor(diff / MONTH)+" months"+qualifier; }
      if (diff < YEAR*2)   { return "1 month"+qualifier; }
      else                 { return "more than a year"+qualifier; }
      // TODO extend to decades & centuries
    }

  })


  _augment(String, {

    capitalise: function(){
      return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
    },

    toCamelCase: function(){
      return this.split(' ').map(function(e){
        return e.capitalise();
      }).join(' ');
    },

    toUnderscore: function(){
      return this.trim().replace(/\s/g, '_');
    },

    reverse: function(){
      return this.split('').reverse().join('');
    },

    strip: function(chars){
      var str = this.valueOf();
      chars.split('').each(function(c){
        str = str.replace(new RegExp('\\'+c,'g'), '');
      });
      return str;
    },

    isEmpty: function(){
      return (this.length === 0) ? true : false;
    },

    toNumber: function(){
      return parseFloat(this);
    },

    encodeURL: function(){
      return escape(this);
    },

    decodeURL: function(){
      return unescape(this);
    },

    encodeHTML: function(){
      return this.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    decodeHTML: function(){
      return this.replace(/&quot;/g, '"').replace(/&gt;/g, '>')
                 .replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    }
  });


  _augment(HTMLElement, {

    hasClass: function(c){
      return new RegExp("(^|\\s)" + c + "(\\s|$)").test(this.className);
    },

    addClass: function(c){
      if (!this.hasClass(c)){ this.className += ' '+c; }
      return this;
    },

    removeClass: function(c){
      if (this.hasClass(c)){
        var regex = new RegExp("(^|\\s)" + c + "(\\s|$)", "g");
        this.className = this.className.replace(regex, " ").trim();
      }
      return this;
    }
  });



  //
  // Define Missing Functions
  //

  if(!document.getElementsByClassName){
    document.getElementsByClassName = function(id) {
      var a, r, e, i;
      a = [];
      r = new RegExp('(^| )'+id+'( |$)');
      e = document.getElementsByTagName("*");
      for (i=0; i<e.length; i++){
        if (r.test(e[i].className)){ a[i] = e[i]; }
      }
      return a;
    }
  }


  if (!window.console) {
    var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml',
      'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info',
      'log', 'markTimeline', 'profile', 'profileEnd', 'table', 'time',
      'timeEnd', 'timeStamp', 'trace', 'warn'],
    length  = methods.length,
    console = window.console = {};
    while (length--) { console[methods[length]] = function(){}; }
  }


})(window)
