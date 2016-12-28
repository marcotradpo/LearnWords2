"use strict";

var BoxOfQuestions = require('../../src/BoxOfQuestions');
var LWdb = require('../../src/LWdb');
var wordlist = require('../../data/wordlist-en-ge.js'); 

var LW;



describe("BoxOfQuestions construction", function() {


  it("should be able to create a BoxOfQuestions object (var 1)", function() {

    // construction
    var LW = BoxOfQuestions(LWdb('learnWords'));

    LW.db.loadWords(wordlist);
 

    // checks
    expect(LW).not.toBe(null);
    expect(LW).not.toBe(undefined);

    expect(LW).toBeObject();

    expect(LW.name).toBe("learnWords");

    expect(LW).toHaveObject("db");
    expect(LW.db.dbName).toBe("learnWords");
    expect(LW.db.numberOfWords()).toBe(12);


  });



  it("should be able to create a BoxOfQuestions object (var 2)", function() {

    // construction

    var LW = function(){

		var db = LWdb('learnWords');

		db.loadWords(wordlist);

		var box = BoxOfQuestions(db);

                // if necessary more configuration later

		return box
        }();


    // checks
    expect(LW).not.toBe(null);
    expect(LW).not.toBe(undefined);

    expect(LW).toBeObject();

    expect(LW.db.dbName).toBe("learnWords");
    expect(LW.db.numberOfWords()).toBe(12);


  });



});






describe("BoxOfQuestions", function() {

    
  beforeEach(function() {

      LW = BoxOfQuestions(LWdb('learnWords'));
      LW.importFrom(wordlist);


      // setup a particular set of step value

      var allWords = LW.db.allWords();
      allWords[0].step = 0;  // question for word has not been answered yet 
      allWords[1].step = 0;
      allWords[2].step = 0;

      allWords[3].step = 1;  // question for word has been answered once
      allWords[4].step = 1;  
      allWords[5].step = 1;
      allWords[6].step = 2;  // word has been answered two times
      allWords[7].step = 3;  // word has been answered three times

      LW.db.putWord(allWords[0]);
      LW.db.putWord(allWords[1]);
      LW.db.putWord(allWords[2]);
      LW.db.putWord(allWords[3]);
      LW.db.putWord(allWords[4]);
      LW.db.putWord(allWords[5]);
      LW.db.putWord(allWords[6]);
      LW.db.putWord(allWords[7]);
    
  });


  it("should indicate the correct library version", function() {

    expect(LW).toHaveString("version");
    expect(LW.version).toBe('0.2.1');

  });



  it("should support the Box API 2", function() {

    expect(LW).toHaveString("version");

    expect(LW).toHaveMethod("question");
    expect(LW).toHaveMethod("answer");
    expect(LW).toHaveMethod("moveQuestionForward");
    expect(LW).toHaveMethod("moveQuestionBackwards");


    expect(LW).toHaveMethod("importFrom");
    expect(LW).toHaveMethod("wordsToRepeat");


    expect(LW).toHaveMethod("wordsWithStepValue");
    expect(LW).toHaveMethod("chooseRandomObject");
    expect(LW).toHaveMethod("config");
    expect(LW).toHaveMethod("status");


  });




  it("should be able to import questions", function() {

    expect(LW).not.toBe(null);


    expect(LW.db).toHaveMethod("loadWords");

    expect(LW).toHaveMethod("importFrom");

    expect(LW.db.numberOfWords()).toBe(12);

    var allWords = LW.db.allWords();
    var aWord = allWords[0];
    expect(aWord.step).toBe(0);


    aWord = allWords[4];
    expect(aWord.step).toBe(1);

    aWord = allWords[8];
    expect(aWord.step).toBe(-1);

  });







  it("should have a helper function to get random integers", function(){

    expect(LW).not.toBe(null);

    // FIXME
    // expect(LW).toHaveMethod("_getRandomInt");

    var n = LW.db.numberOfWords();

    expect(n).toBe(12);
    expect(LW.db.allWords().length).toBe(12);

    // FIXME add more expect

    // expect(LW._getRandomInt(0,n-1)).toBeNumber(); 

  });









  it("should be able to indicate which words are to be repeated", function() {

    expect(LW).not.toBe(null);    
    expect(LW).toHaveMethod("wordsToRepeat");


    var r0 = LW.wordsToRepeat();
  
    expect(r0.length).toBeNumber();
    expect(r0.length).toBe(8);

    LW.question();
    LW.moveQuestionForward();

    var r1 = LW.wordsToRepeat();
    expect(r1.length).toBeNumber();
    expect(r1.length).toBe(7);


    LW.question();
    LW.moveQuestionForward();

    var r2 = LW.wordsToRepeat();
    expect(r2.length).toBeNumber();
    expect(r2.length).toBe(6);


    LW.question();
    LW.moveQuestionForward();

    var r2 = LW.wordsToRepeat();
    expect(r2.length).toBeNumber();
    expect(r2.length).toBe(5);


  });



  it("should give an array of words having particular step values", function() {

    expect(LW).not.toBe(null);    
    expect(LW).toHaveMethod("wordsWithStepValue");

    var wordWithStepEqualMinus1 = LW.wordsWithStepValue(-1);
    expect(wordWithStepEqualMinus1.length).toBe(4);
      
    var wordsWithStep0 = LW.wordsWithStepValue(0);
    expect(wordsWithStep0.length).toBe(3);

    var wordsWithStepMinus1ToZero = LW.wordsWithStepValue(-1,0);
    expect(wordsWithStepMinus1ToZero.length).toBe(7);

    var wordsWithStepMinus1ToPlus1 = LW.wordsWithStepValue(-1,1);
    expect(wordsWithStepMinus1ToPlus1.length).toBe(10);


  });




  it("should be able to give a question", function() {

    expect(LW).not.toBe(null);
    expect(LW).toHaveMethod("question");

    var q = LW.question();

    expect(q).not.toBe(null);
    expect(q).not.toBe(undefined);
    expect(q).toBeObject();    

    expect(q).toHaveString("translate");
    expect(q).toHaveNumber("step");
    expect(q).toHaveNumber("date");

    var todayNow = new Date();

    expect(q.date <= todayNow).toBe(true);


    var id1 = q._id;
    var r1 = LW.wordsToRepeat();
    expect(r1).toBeArray();
    var n1 = r1.length;

    LW.moveQuestionForward();
    // This means the question has been answered
    // correctly.
    // Thus we should get a next question

    q = LW.question();

    // which is different from the previous one.
    expect(q._id).not.toBe(id1);

    // and the number of remaining questions should be
    // one less.
    var r2 = LW.wordsToRepeat();
    expect(r2).toBeArray();
    var n2 = r2.length;
    expect(n2).toBe(n1-1); 


  });


  it("should be able to give questions until there are no more questions", function() {
     var q;
     var noOfQuestions = 0;
      do {
       q = LW.question();
           LW.moveQuestionBackwards();
           if(q) {// q is not null
                  noOfQuestions =  noOfQuestions +1};
      } while (q);
   
     expect(noOfQuestions).toBe(8);
  });







  it("should be able to give an answer", function() {

    expect(LW).not.toBe(null);


    expect(LW).toHaveMethod("answer");


    var a = LW.answer();

    expect(a).not.toBe(null);
    expect(a).not.toBe(undefined);

    // FIXME add more expect statements

  });









 it("should be able to give answer options", function() {


    // Check API
    expect(LW).not.toBe(null);

    expect(LW).toHaveMethod("getAnswerOptions");

    expect((LW.wordsToRepeat()).length > 0).toBe(true);


    // default value

    expect((LW.db.getSettings()).numberOfOptions).toBe(4);


    var question = LW.question();

    // check availability of numberOfOptions property
    var settings = LW.db.getSettings();
    expect(settings).toBeObject();
    expect(settings).toHaveNumber("numberOfOptions");
 


    // check number of options

    var n = settings.numberOfOptions;

    var options = LW.getAnswerOptions();
    
    expect(options).toBeArray();
    expect(options.length).toBe(n);



    // verify is all _ids of all elements 
    // in options are different

    var idOptionsSet = new Set();

    options.forEach(function(element) {
       idOptionsSet.add(element._id);
    });
    
    expect(idOptionsSet.size).toBe(n);
    



    // Check it question is included in answerOptions
   
    expect(idOptionsSet.has(question._id)).toBe(true);




    // FIXME add more expect statements

  });




  it("should be able to move an incorrect question back in the box", function() {

        var q = LW.question();
        var question_id = q._id;
      
        LW.moveQuestionBackwards(); // issue #65

        var updatedWord = LW.db.getWord(question_id);

        expect(updatedWord.date).toBeNumber();
        expect(updatedWord.date).toBeGreaterThan(new Date().valueOf());

        
        expect(updatedWord.step).toBe(0);
        // this assumes we do not have a learn mode yet

  });






  it("should be able to move an answer forward", function() {

         
         var q = LW.question();
         expect(q).toBeObject();

	 expect(LW).toHaveMethod("moveQuestionForward");

         var _id = q._id;
         var step = q.step;
         var date = q.date;

         LW.moveQuestionForward();

         // get updated question object
         q = LW.db.getWord(_id);

         expect(_id == q._id).toBe(true);
         expect(step + 1 == q.step).toBe(true);
         expect(date < q.date).toBe(true);

  });



  it("should be able choose a random object from a collection", function() {

        // LW.chooseRandomObject(anArray); issue #59
        // returns a random object from anArray.

        expect(wordlist).toBeArray();

        var _id;
        var sum = 0;

        for(var i = 0; i < 2000; i++){
        _id = (LW.chooseRandomObject(wordlist))._id;

        expect(_id >=1).toBe(true); 
        expect(_id <=12).toBe(true);
        sum = sum + _id;
        }


        expect(sum/2000 >=6.3).toBe(true); 
        expect(sum/2000 <=6.7).toBe(true);
        
  });




  it("should be able to make use of settings information", function() {
  
    var s = LW.db.getSettings();

    expect(s.delay).toBeNumber();
   
    expect(s.factorForDelayValue).toBeArray();
    expect(s.factorForDelayValue.length).toBeGreaterThan(0);

    expect(s.offerLearnMode).toBeBoolean();


  });


 
  it("should be able to give status information", function() {
  
    var st = LW.status();
   
    expect(st).toBeObject();
    expect(st.numberOfWords).toBe(12);

    // FIXME
    // add number of words in wordsToRepeat

  });

});
