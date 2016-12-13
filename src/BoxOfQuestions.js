"use strict";

var LWdb = require('./LWdb');


function BoxOfQuestions(db) {

        // assign database
	this.db = db;
	this.name = db.name;



        // initialize values
        var _question = null; // no current question
        var _wordsToRepeat = null; // words which are eligible to be repeated.
                                   // initialisation to null forces calculation 
                                   // on first call of wordsToRepeat()
        var that = this;




        this.question = function(){
            // gives back a question to ask
            // if _question is null then go for a new one.

            if (!_question) {
                 _question = that.chooseRandomObject(this.wordsToRepeat())
                 return _question
            } else
            {
              return _question // existing value
            }
        };




        this.answer = function(){
            return (this.question()).translate;
        };






        this._questionHasBeenProcessed = function(){

               _question = null; 

               // This will trigger a new question, when LW.question()
               // is called the next time.

               
	       
        };



        this._getRandomInt = function(min, max){
             // Returns a random integer between min (inclusive) and max (inclusive)
             // Using Math.round() will give you a non-uniform distribution!
             
    		return Math.floor(Math.random() * (max - min + 1)) + min;
	};


	this.chooseRandomObject = function(anArray){
                return anArray[that._getRandomInt(0,anArray.length-1)];
	};



        this.moveQuestionBackwards = function(){
            if (_question) { // we have a question


                // set new date for asking the question again;
                // this has to be a a delay period later.

                _question.date = new Date().valueOf() + (that.db.getSettings()).delay;


                // put the question back at the correct step

                var s = that.db.getSettings();

                if (s.offerLearnMode) { _question.step = 1;
                                       // step 0 is the learnmode, thus do not put
                                       // it at step 0 
                                       // step 1 is the lowest step of the learn mode.
                                      }
                else { // treat all the steps the same way, as repeat mode
                       // thus the lowest step value is 0
                       _question.step = 0; 
                     
                 }


                // An alternative which is not implemented:
                // 
                // Set new step value to step - 1
                // With the result being not less than 1 or 0 depending on offerLearnMode.


                that.db.putWord(_question);

                // As the question has a new later date it is no more 
                // a current question

                that._questionHasBeenProcessed();
            }
        };





       this.moveQuestionForward = function(){
            if (_question) { // we have a question
                 var s = that.db.getSettings();

                // calculate new date. This depends on which step the question is.
                // And the delay calculation factor for that particular step.
                _question.date = new Date().valueOf() + 
                                 s.delay * s.factorForDelayValue[_question.step];

                // With repeated calls to this method 
                // the following will move the question up 
                // just one step beyond the last step.
                // A step value beyond the last step value will prevent the
                // question appearing in the wordsToRepeat collection
                // the next time wordsToRepeat is calculated.

                _question.step = _question.step + 1;


                that.db.putWord(_question);


                // As the question has a new later date it is no more 
                // a current question

                that._questionHasBeenProcessed();

               
            }  
       };





       this.wordsToRepeat = function(){

          var lowestStep;
          var todayNow = new Date().valueOf();

          var s = that.db.getSettings();

          if (s.offerLearnMode) { 
                                  lowestStep = 1
                                  // 1 is lowest step for repeat mode
               }
          else { // treat all the steps the same way.
                 // we only have a repeat mode
                 // thus the lowest step value is 0

                 lowestStep = 0; 
          }          


          function isToBeRepeated(aWord) {
               return (aWord.step >= lowestStep) && (todayNow >= aWord.date);
          }

          

          if (_question == null || _wordsToRepeat == null) { 
                // _question == null means that either a question has never
                // been asked before or that a question has been asked and
                // processed but no new question yet has been picked.
                // In both cases a new _wordsToRepeat collection is necessary.

                _wordsToRepeat = (that.db.allWords()).filter(isToBeRepeated)
          };

          return _wordsToRepeat;
       };

}


BoxOfQuestions.prototype.importFrom = function(anArrayOfObjects){
     this.db.importFrom(anArrayOfObjects);
};






BoxOfQuestions.prototype.getAnswerOptions = function(numberOfOptions){
  throw new Error("not yet implemented");
};



BoxOfQuestions.prototype.config = function(config){
  throw new Error("not yet implemented");
};



BoxOfQuestions.prototype.status = function(){
  // give the number of words in the whole box
  // and the number of words in wordsToRepeat

  var status = {};
  status.numberOfWords = this.db.numberOfWords();

  // FIXME add more content to status
  
  return status
};




module.exports = BoxOfQuestions;
