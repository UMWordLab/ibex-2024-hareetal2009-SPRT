PennController.ResetPrefix(null);
DebugOff();
 
var shuffleSequence = seq(//"consent", 
                            "setup", 
                            //"demo",
                             "intro",
                            "startpractice",
                                            
                            sepWith("seppractice", "practice"),
                        
                            "setcounter",
                            "starter",

                            // trials named _dummy_ will be excluded by following:
                            sepWith("sep", randomize(anyOf("experiment"))),

                            "sendresults",
                            "completion"
                         );
 


// Welcome screen and logging user's ID
newTrial("setup",
     // Automatically print all Text elements
    defaultText
        .cssContainer({"margin-bottom":"1em", "margin-left":"5em"})
        .print()
    ,
    defaultTextInput
        .css("margin","1em")    // Add a 1em margin around this element
        .css("margin-left", "6em")
        .print()
        ,
    defaultDropDown
        .css("margin","1em")    // Add a 1em margin around this element
        .css("margin-left", "6em")
        .print()
        ,
    newText("Hi!")
    ,
    newText("To get started, we'll collect some basic information so that we can assign you credit and compare results across English language background groups.")
    ,
    newText("Enter your uniqname (<b>without the @umich.edu</b>):")
    ,
    // ID input
    newTextInput("inputID", "")
  //     .center()
    ,
    newText("We will be using a 'secret code' to share your data so that you can find it but others cannot identify it as yours for all experiments run in this class. You should use the same code for all experiments, so create one and note it down (or add to a password keeper) to be able to find your results and use on other future experiments. If you have already created a code for another experiment, enter that one here. If you haven't created your code yet, please make one that is <b>at least 8 characters long</b>. This should be something relatively unique, but appropriate for sharing with the class on an open website. Data with missing, offensive, or inappropriate codes will not be posted (so you will not be able to see your result):")
    ,
    // ID input
    newTextInput("codeID", "")
    ,
    newText("Was <b>English</b> a primary or dominant language of your environment for most of your first ten years?")
    ,
    // English input
    newDropDown("inputEnglish" , "")
        .add( "yes" , "no" )
    ,
    newText("Was a <b>language other than English</b> a primary or dominant language of your environment for most of your first ten years? (including those bilingual with English)")
    ,
    // NonEnglish input
    newDropDown("inputNonEnglish" , "")
        .add( "yes" , "no" )
    ,
    newButton("Start")
        .center()
        .print()
        // Only validate a click on Start when inputID has been filled
        .wait( getTextInput("inputID").testNot.text("") )
    ,
    // Store the text from inputID into the Var element
    newVar("partID")
        .global()
        .set(getTextInput("inputID") )
    ,
    newVar("codeID")
        .global()
        .set(getTextInput("codeID") )
    ,
    newVar("English")
        .global()
        .set(getDropDown("inputEnglish") )
    ,
    newVar("NonEnglish")
        .global()
        .set(getDropDown("inputNonEnglish") )
)
.log("English", getVar("English"))
.log("NonEnglish", getVar("NonEnglish"))

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
.log( "partid" , getVar("partID") ) // Add the ID to all trials' results lines
.log( "codeid" , getVar("codeID") ) // Add the code to all trials' results lines
 
 
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
      if (item[0].type.startsWith("experiment")) {
          item_count++;
          new_ro.push(item);
        // first number after item count is how many items between breaks. second is total-items - 1
          if (item_count%20===0 & item_count<57){
         // value here should be total_items - items_per_block (to trigger message that last block is coming up)
              
              // NEW: Had to add 3 to get the message to show? I think the message DynamicElement
              // that is added at the end of this function is increasing the length of RO? Not sure.
              if (item_count===40){
                  text="End of block. Only 1 block left!";
                  }
              else {
        // first number is the total number of blocks. second number is number of items per block
                  text="End of block. "+(3-(Math.floor(item_count/20)))+" blocks left.";
              }ro[i].push(new DynamicElement("Message", 
                                { html: "<p>30-second break - stretch and look away from the screen briefly if needed.</p>" + text, transfer: 30000 }));
          }
        } else {
        new_ro.push(item);
        }
    }
    return new_ro;
  }
 
  Template("practice.csv", row => 
    newTrial("practice",
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
        .log("stimitem", row.item)
        .log("cond1", row.cond1)
        .log("cond2", row.cond2)
        .log("cond3", row.cond3)
        .log("correct_response", row.correct_response)
        .log("group", row.group)
        )

Template("hareetal_stims.csv", row => 
    newTrial("experiment",
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
       .log("stimitem", row.item)
       .log("cond1", row.cond1)
       .log("cond2", row.cond2)
       .log("cond3", row.cond3)
       .log("correct_response", row.correct_response)
       .log("group", row.group)
      )

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
            ["p", "First you can do twenty warm-up sentences to get used to the method and answering the comprehension questions."]
            ]}],
    
   ["starter", Message, {consentRequired: false,
    html: ["div",
            ["p", "Time to start the main portion of the experiment!"]
            ]}],
            
    
   ["completion", "Form", {continueMessage: null, html: { include: "completion.html" } } ]
 
];

