"use strict";

var LWdb = require('../../src/LWdb');
var wordList = require('../../data/wordlist-en-ge.js'); 

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./scratch');
}

describe("Database LWdb", function() {

  var lwdb;

  beforeAll(function(){
    this.wordList = wordList;
  });

  beforeEach(function() {
    // clear properties that didn't exist in original wordList
    for(var i = 0; i < this.wordList.length; i++){
      var aWord = this.wordList[i];
      for(var key in aWord){
        if(key != "word" && key != "translate" && key != "_id"){
          delete aWord[key];
        }
      }
    }

    localStorage.clear();
    lwdb = LWdb("LearnWords");
  });


  afterEach(function(){
    lwdb.destroy();
  });


  it("should be able to create a DB", function() {

    expect(lwdb).toBeObject();
    
    expect(lwdb).toHaveString("dbName");
    expect(lwdb.dbName).toBe("LearnWords");


    expect(lwdb).toHaveMethod("putWord");
    expect(lwdb).toHaveMethod("getWord");
    expect(lwdb).toHaveMethod("importFrom");
    expect(lwdb).toHaveMethod("loadWords");
    expect(lwdb).toHaveMethod("keysOfAllWords");

    // FIXME
    // add more methods

  });



  it("should be able to answer if persistent storage is available", function() {

    expect(lwdb).toHaveMethod("persistentStorageOK");
    expect(lwdb.persistentStorageOK()).toBeTrue();

  });


  it("should be able to reinitialize the persistent storage", function() {
    
    lwdb.removeWords();
    expect(lwdb).toHaveMethod("numberOfWords");
    expect(lwdb.numberOfWords()).toBe(0);

  });



  describe("deals with words;", function() {

    it("should be able to answer the number of words", function() {
      expect(lwdb.numberOfWords()).toBe(0);
    });


    it("should be able to store a new word", function() {
      // Inserts a new document, or new version of an existing document
      expect(lwdb.numberOfWords()).toBe(0);
      var i = parseInt(Math.floor(Math.random()*this.wordList.length));
      var aWord = this.wordList[i];
      aWord._id = (i+1);
      lwdb.putWord(aWord);
      expect(lwdb.numberOfWords()).toBe(1);
    });


    it("should be able to get a word", function() {  

      var newWord = {
        "_id": 1,
        "word": "melon",
        "translate": "die Melone"
      };

      expect(lwdb.numberOfWords()).toBe(0);
      lwdb.putWord(newWord);
      expect(lwdb.numberOfWords()).toBe(1);
      var r = lwdb.getWord(1);
      expect(r).toBeObject();

      expect(r).toHaveNumber("_id");
      expect(r._id).toBe(1);

      expect(r).toHaveString("word");
      expect(r.word).toBe("melon");

      expect(r).toHaveString("translate");
      expect(r.translate).toBe("die Melone");

      expect(r).toHaveNumber("step");
      expect(r.step).toBe(0);

      expect(r).toHaveNumber("date");
      expect(r.date).toBe(0);

    });


    it("should be able to remove all words", function() {
      // insert first n words from wordList
      var n = parseInt(Math.floor(Math.random()*this.wordList.length));
      var aWord;
      for(var i = 0; i < n; i++){
        aWord = this.wordList[i];
        aWord._id = (i+1);
        lwdb.putWord(aWord);
      }
      expect(lwdb.numberOfWords()).toBe(n);
      lwdb.removeWords();
      expect(lwdb.numberOfWords()).toBe(0);

    });





    it("should be able to answer a list of all keys of all words", function() {
      // test setup
      // insert first n words from wordList
      // n is a random number of words

      var n = parseInt(Math.floor(Math.random()*this.wordList.length));

      var aWord;
      for(var i = 0; i < n; i++){
        aWord = this.wordList[i];
        aWord._id = (i+1);
        lwdb.putWord(aWord);
      }


      // run

      var r = lwdb.keysOfAllWords();


      // check result
      expect(r).toBeArrayOfStrings();
      expect(r.length).toBe(lwdb.numberOfWords());
       
      for(var i = 0; i < r.length; i++){
        expect(r[i]).toBe("LearnWords-wd-"+(i+1));
      }

    });









    it("should be able to answer a list of all words", function() {

      // setup
      // insert first n words from wordList
      var n = parseInt(Math.floor(Math.random()*this.wordList.length));


      var aWord;
      for(var i = 0; i < n; i++){
        aWord = this.wordList[i];
        aWord._id = (i+1);
        lwdb.putWord(aWord);
      }

      expect(lwdb.numberOfWords()).toBe(n);



      // run

      var r = lwdb.allWords();


      // check

      expect(r).toBeArray();
      expect(r.length).toBe(lwdb.numberOfWords());
      expect(r.length).toBe(n);

      for(var i = 0; i < r.length; i++){
        var tmp = this.wordList[i];
        tmp._id = i+1;
        
        expect(r[i]).toHaveString("word");
        expect(tmp).toHaveString("word");
        expect(r[i].word).toBe(tmp.word);

        expect(r[i]).toHaveString("translate");
        expect(tmp).toHaveString("translate");
        expect(r[i].translate).toBe(tmp.translate);

        expect(r[i]).toHaveNumber("_id");
        expect(tmp).toHaveNumber("_id");
        expect(r[i]._id).toBe(tmp._id);

        expect(r[i]).toHaveNumber("date");
        expect(tmp).toHaveNumber("date");
        expect(r[i].date).toBe(tmp.date);

        expect(r[i]).toHaveNumber("step");
        expect(tmp).toHaveNumber("step");
        expect(r[i].step).toBe(tmp.step);

      }

    });






    it("should be able to import words", function() {

      // setup
      lwdb.removeWords();
      expect(lwdb.numberOfWords()).toBe(0);

      expect(lwdb).toHaveMethod("importFrom");
      var theWordList = this.wordList;
      expect(theWordList).toBeArrayOfObjects();


      // run

      lwdb.importFrom(theWordList);

      
      // check

      var keys = lwdb.keysOfAllWords(); 
      expect(keys.length).toBe(theWordList.length);

    });




    it("should be able to maintain an index", function() {
      // Is this a duplicate?

      // setup
      lwdb.removeWords();
      expect(lwdb.numberOfWords()).toBe(0);
      
      lwdb.importFrom(this.wordList);
      expect(lwdb.numberOfWords()).toBe(this.wordList.length);


      // run
      var keys = lwdb.keysOfAllWords();


      // check
      expect(keys).toBeArray();
      expect(keys.length).toBe(this.wordList.length);
    });


  });






  describe("LWdb deals with settings", function() {

    it("should be able to answer settings", function() {
      var settings = lwdb.getSettings();
      expect(settings).not.toBe(null);
      expect(settings).toBeObject();
    });


    it("should be able to store settings", function() {
      // test needs improvement
      var settings = lwdb.getSettings();
      settings.factorForDelayValue[3] = 6;
      lwdb.putSettings(settings);
      settings = lwdb.getSettings();
      expect(settings).toBeObject();
      expect(settings).toHaveArray("factorForDelayValue");
      expect(settings.factorForDelayValue[3]).toBe(6);
    });


  });

});
