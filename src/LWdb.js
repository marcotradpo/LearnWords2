
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// NOTE: pay special attention to how the number of Words is calculated
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX






















"use strict";
// ----------------------------------------------------------------------
// LearnWords 2 
//
// File: 
//    LWdb.js
//
// Purpose: 
//    Database layer
//    Definition of an LWdb object
//
// Date:
//    3rd December 2016
//
// ----------------------------------------------------------------------


if (typeof localStorage === "undefined" || localStorage === null) {
  // we run in node thus we need to have a simulation of LocalStorage
  var LocalStorage = require('node-localstorage').LocalStorage;
  global.localStorage = new LocalStorage('./scratch');
}




var LWdb = function(name) {

    // functional style, 
    // closure, returns an LWdb object

    var dbName = name;

    // private variables

    var _keysOfAllWords = [];

    var _numberOfWords = 0;

    
    var recalculateIndex = true; 





    // private methods


    var _wdKeyFor = function(anInteger) { 
        return dbName+'-wd-'+anInteger;
    };



    var _setNumberOfWords = function(n) {
        var key = dbName+'-numberOfWords';
        localStorage.setItem(key,n);
        _numberOfWords = n;
        recalculateIndex = true;
    };



    var _incNumberOfWords = function() {
        _setNumberOfWords(_numberOfWords + 1);
        recalculateIndex = true;
    };


    var _invalidateIndex = function() {
        recalculateIndex = true;
    };



    var _indexNeedsRecalculation = function() {
        return recalculateIndex
    };



    var _indexHasBeenUpdated = function() {
        recalculateIndex = false;
    };




    var _removeObjects = function(aKeyPrefix){
        if (isOK) {
            var key;
            var st; 
            var keysToDelete = [];

            // find all keys starting with aKeyPrefix
            for (var i = 0; i < localStorage.length; i++){
                key = localStorage.key(i);
                st = localStorage.getItem(key);                             

                if (key.lastIndexOf(aKeyPrefix,0) === 0) {
                    keysToDelete.push(key);
                }
            }

            keysToDelete.forEach(function(aKey){
                localStorage.removeItem(aKey);
            });

        }
        };
    








    // construct literal LWdb object
    // methods and properties are public

    return {


    putSettings : function(anObject) {
        
        var key = dbName + '-settings';
        return localStorage.setItem(key,JSON.stringify(anObject));  
    },






    removeWords : function() {
        var keys = keysOfAllWords(); 
        for (var i = 0; i < keys.length; i++){
            localStorage.removeItem(keys);
        }
        _setNumberOfWords(0);
    },






    destroy : function(anObject) {

         var aKeyPrefix = dbName;  
         _removeObjects(aKeyPrefix);
    },



      persistentStorageOK : function() {
        return !!localStorage;
      },




      isOK : function() {
         return persistentStorageOK();
      },






    numberOfWords : function() {
     
       var key = dbName+'-numberOfWords';
        var r = 0;

        if (isOK) {
            r = localStorage.getItem(key);
            if (r == null) {
                localStorage.setItem(key,'0'); 
                r = '0';
            };
          r = parseInt(r);
        }; 
        _numberOfWords = r;
        return r;
    },








    putWord : function(aWord) {

        if(!aWord._id){
            throw "_id is required in a word";
        }
        if(!aWord.step){
            aWord.step = 0;
        }
        if(!aWord.date){
            aWord.date = 0;
        }

        // get storage key 
        var storageKey = _wdKeyFor(aWord._id);
        // try to get the word to check if it already exists
        var value = localStorage.getItem(storageKey); 
     
        // save the word
        localStorage.setItem(storageKey, JSON.stringify(aWord));

        // if the word has not existed before increment the number of words
        if (value == null) {
            _incNumberOfWords();
        };
        // console.log('storageKey is=', storageKey, 'word is=', copy.word);
        return storageKey;
    },







    getWord : function(anInteger) {
        var storageKey = _wdKeyFor(anInteger);
        try{
            var aWord = JSON.parse(localStorage.getItem(storageKey));
            if(!aWord.step){
                aWord.step = 0;
            }
            if(!aWord.date){
                aWord.date = 0;
            }
            return aWord;
        }catch(e){
            return null;
        }
    },



    importFrom : function(theWords) {
      
      var key;
      var n = theWords.length;

      var aWord;
      
      for(var i = 0; i < n; i++){
        aWord = theWords[i];
	key = this.putWord(aWord);
      }

      _invalidateIndex();

    },




    loadWords : function(theWords) {
        // FIXME
        console.log ("db.loadWords");
        this.importFrom(theWords);
    },







    keysOfAllWords : function() {
        if (_indexNeedsRecalculation()) {
            _keysOfAllWords = [];
            var keyRegex = new RegExp("^"+dbName+"\\-wd\\-\\d+$");
            for (var i = 0; i < localStorage.length; i++){
                var key = localStorage.key(i);
                // check it starts with <name>-wd-
                if(keyRegex.test(key)){
                    _keysOfAllWords.push(key);
                }
            }
        };
        _indexHasBeenUpdated();
        return _keysOfAllWords;
    },





    allWords : function() {
        var keys = keysOfAllWords();
        var words = [];
        for(var i = 0; i < keys.length; i++){
            var str = localStorage.getItem(keys[i]);
            words.push(JSON.parse(str));
        }
        return words;
    },





    getSettings : function() {
        
        var key = dbName + '-settings';

        var value = localStorage.getItem(key);

        // lazy initialisation
        if (value==null) { 
            // define default value for settings    
            value = { "delay": 8640000, 
                      "factorForDelayValue": [1,1,3,7,45,90,360,1000],
                      "offerLearnMode": false
                      };
            // One day = 24h * 60m * 60s * 100μs
            // the delay has been shortened to 1 day/100 for test purposes.
            // this is used to calculate the new date after a
            // word has been answered correctly.
            putSettings(value);
            return value
        } else {
            return JSON.parse(value)
        }
    }









    }  // end of literal LWdb object




}; // end of LWdb function definition


module.exports = LWdb;

