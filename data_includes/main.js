PennController.ResetPrefix(null);
//DebugOff();

 
var shuffleSequence = seq("consent", "IDentry", "demo", "intro",
                            "startpractice",
                                            
                            sepWith("seppractice", "practice"),
                        
                            "setcounter",
                            "starter",

                            // trials named _dummy_ will be excluded by following:
                            sepWith("sep", randomize(anyOf(
                                startsWith("chow"),
                                startsWith("kutas")
                                ))),

                            "sendresults",
                            "completion"
                         );
 
newTrial("IDentry",
   newText("instr", "Please enter your uniqname:").print()
   ,
   newHtml("partpage", "<input type='text' id='partID' name='participant ID' min='1' max='120'>").print()
   ,
   newButton("Next").print().wait(
       getVar("partID").set( v=>$("#partID").val() ).testNot.is('')
   )
)

newTrial("intro",
    newHtml("introhtml", "intro1.html")
        .print(),

    newText("What key do you press to read the sentence")
        .print()
        .bold(),

        newScale("q1", "Spacebar", "J")
            .labelsPosition("right")
            .print(),

    newText("How should you read the sentence")
        .print()
        .bold(),

        newScale("q2", "Out loud", "Silently")
            .labelsPosition("right")
            .print(),

    newText("How quickly should you advance the words in the sentence to continue reading?")
        .print()
        .bold(),

        newScale("q3", "As fast as you can press the key", "Quickly but slow enough to answer the follow-up questions", "Slowly enough to get every answer correct")
            .labelsPosition("right")
            .print(),

    newText("Will the entire sentence stay on the screen?")
        .print()
        .bold(),

        newScale("q4", "No", "Yes")
            .labelsPosition("right")
            .print(),

    newText("error", "One or more of your responses to the questions above are incorrect")
        .color("red")
        .bold(),

    newButton("Continue")
        .print()
        .wait(
            getScale("q1").test.selected("Spacebar").failure(
                getText("error")
                    .print()
            ).and(getScale("q2").test.selected("Silently").failure(
                getText("error")
                    .print()
            )).and(getScale("q3").test.selected("Quickly but slow enough to answer the follow-up questions").failure(
                getText("error")
                    .print()
            )).and(getScale("q4").test.selected("No").failure(
                getText("error")
                    .print()
            ))
        )
)

 
 
Header(
   newVar("partID").global()   
)
.log( "partid" , getVar("partID") )
 
 
 
var showProgressBar =false;
 
var practiceItemTypes = ["practice"];
 
var manualSendResults = true;
 
var defaults = [
];

function modifyRunningOrder(ro) {

    var new_ro = [];
    item_count=0;
    for (var i in ro) {
      var item = ro[i];
      // fill in the relevant experimental condition names on the next line
      if (item[0].type.startsWith("chow")|| item[0].type.startsWith("kutas")) {
          item_count++;
          new_ro.push(item);
        // first number after item count is how many items between breaks. second is total-items - 1
          if (item_count%40===0 & item_count<117){
         // value here should be total_items - items_per_block (to trigger message that last block is coming up)
              
              // NEW: Had to add 3 to get the message to show? I think the message DynamicElement
              // that is added at the end of this function is increasing the length of RO? Not sure.
              if (item_count===80){
                  text="End of block. Only 1 block left!";
                  }
              else {
        // first number is the total number of blocks. second number is number of items per block
                  text="End of block. "+(3-(Math.floor(item_count/40)))+" blocks left.";
              }ro[i].push(new DynamicElement("Message", 
                                { html: "<p>30-second break - stretch and look away from the screen briefly if needed.</p>" + text, transfer: 30000 }));
          }
        } else {
        new_ro.push(item);
        }
    }
    return new_ro;
  }
 
 
Template("experiment.csv", row => {

   items.push(
       [[row.label, row.item] , "PennController", newTrial(
           newController("DashedSentenceAlt", {s: row.sentence})
               .print()
               .log()
               .wait()
               .remove(),

            row.comprehension_question ? 
            newController("QuestionAlt", { 
                                      as: [["f", row.answerchoice0], ["j",row.answerchoice1]],
                                      // Needs to be cast as Num or else controller won't work
                                      // is expecting a Number
                                      hasCorrect: Number(row.correct_response),
                                      q: row.comprehension_question,
                                      randomOrder: false,
                                      presentHorizontally: true,
                                      timeout: 20000
            })
                .print()
                .log()
                .wait()
               :null   
        )
       .log("counter", __counter_value_from_server__)
       .log("label", row.label)
       .log("latinitem", row.item)
       .log("correct_response", row.correct_response)
       .log("group", row.group)
       ]
   );
   return newTrial('_dummy_',null);
})

newTrial("demo",
   newHtml("Form", "demo.html")
       .log()
       .print()
   ,
   newButton("continue", "Submit")
       .css("font-size","medium")
       .center()
       .print()
       .wait(   
           getHtml("Form").test.complete()
           .failure( getHtml("Form").warn())
           ,
           newTimer("waitDemo", 500)
               .start()
               .wait()
           )
)
 

var items = [
 
   ["setcounter", "__SetCounter__", { }],
 
   ["sendresults", "__SendResults__", { }],
 
   ["consent", "Form", { html: { include: "consent.html" } } ],
 
   ["sep", "Separator", {transfer: 1000, normalMessage: "Please wait for the next sentence.", errorMessage: "Please wait for the next sentence."}],

   ["seppractice", "Separator", {transfer: 1000, normalMessage: "Correct response! Please wait for the next sentence.", errorMessage: "Incorrect response."}],

["startpractice", Message, {consentRequired: false,
   html: ["div",
          ["p", "First you can do three practice sentences."]
         ]}],
 
["practice", "DashedSentenceAlt", {s:"The carpenter ordered food from the restaurant."},
            "QuestionAlt",  
            {as: [["f", "A restaurant"], ["j","A store"]],
            hasCorrect: 0,
            q: "Where did a carpenter get food from?",
            randomOrder: false,
            presentHorizontally: true}
],

["practice", "DashedSentenceAlt", {s:"The man from the newspaper despised pencils."},
            "QuestionAlt",  
            {as: [["f", "Pencils"], ["j","Newspapers"]],
            hasCorrect: 0,
            q: "What did a man despise?",
            randomOrder: false,
            presentHorizontally: true}

],
  
["practice","DashedSentenceAlt", {s:"The babysitter scolded the forgetful children."},
            "QuestionAlt",{  
            as: [["f", "A dad"], ["j","A babysitter"]],
            hasCorrect: 1,
            q: "Who scolded the children?",
            randomOrder: false,
            presentHorizontally: true}
],

["practice","DashedSentenceAlt", {s:"None of the zookeepers saw the tiger escape from its enclosure."},
            "QuestionAlt",{  
            as: [["f", "A lion"], ["j","A tiger"]],
            hasCorrect: 1,
            q: "What animal escaped?",
            randomOrder: false,
            presentHorizontally: true}
],
 
["starter", Message, {consentRequired: false,
   html: ["div",
          ["p", "Time to start the main portion of the experiment!"]
         ]}],
        
 
["completion", "Form", {continueMessage: null, html: { include: "completion.html" } } ]
 
];






