
/*	ENTER YOUR APP'S JAVASCRIPT CODE HERE!	*/

// this function fires at the ready state, which is when the DOM is
// ready for Javascript to execute
var loggedUser = {};
var currentconversation = {};
var overallaverage = 0;

$(document).ready(function() {

	// Initialize Firebase
	// NOTE: you can also copy and paste this information from your project
	//       after you initialize it
	var config = {
		apiKey: "AIzaSyDKjX6V98XOfLX7K4w3qVuD3NJNXhK3Kew",
		authDomain: "whoo-whoop.firebaseapp.com",
		databaseURL: "https://whoo-whoop.firebaseio.com",
		storageBucket: "",
		messagingSenderId: "289781084220"
	};
	firebase.initializeApp(config);

	// @NOTE: it's probably a good idea to place your event
	//		  listeners in here :)


	// some firebase variables
	
	var facebookProvider = new firebase.auth.FacebookAuthProvider();
	var twitterProvider = new firebase.auth.TwitterAuthProvider();
	var auth = new firebase.auth();
	var database = new firebase.database();

	var profileRef = database.ref('/profiles');
	
	var conversationRef = database.ref('/conversations');
	var conversationsmembersref = database.ref('/conversationmembers');
	var loggedusednumber = database.ref('/loggedusers');
	var userconvsref = database.ref('/userconversations');

// BUTTONS

	// event listener for the facebook login button
	$("#btn-login").click(function() {
		// sign in via popup
		// PRO TIP: remember, .then usually indicates a promise!
		auth.signInWithPopup(facebookProvider).then(function(result) {
			$("#window-login").hide();
			$("#window-main").show();
			// check for your profile
			profileRef.once("value").then(function(snapshot) {
				// get the snapshot value
				var snapshotValue = snapshot.val();
				console.log(snapshotValue);
				// if no values present, just add the user
				if (snapshotValue == undefined || snapshotValue == null) {
					loggedUser = addNewUser(result, profileRef);
				}
				else {
					// iterate through the object, and determine if the
					// profile is present
					var keys = Object.keys(snapshotValue);
					var found = false;
					for (var i = 0; i < keys.length; i++) {

						// accessing objects:
						// way 1: objectname.objectvalue
						// way 2: objectname['objectvalue']
						if (snapshotValue[keys[i]].email == result.user.email) {
							
							// found the profile, access it
							loggedUser = snapshotValue[keys[i]];
							loggedUser.id = keys[i];
							found = true;
						}
					}
					// profile is not found, add a new one
					if (!found) {
						loggedUser = addNewUser(result, profileRef);
					}
				}
				loadtopics(conversationRef, database);
				loadmyconversations(userconvsref);
			});
		}, function(error) {
			console.log("Oops! There was an error");
			console.log(error);
		});
	});
	// event listener for the twitter login button
	$("#btn-logintw").click(function() {
		// sign in via popup
		// PRO TIP: remember, .then usually indicates a promise!
		auth.signInWithPopup(twitterProvider).then(function(result) {
			console.log ("logged w twitter");
			$("#window-login").hide();
			$("#window-main").show();
			console.log ("completed");
			// check for your profile
			profileRef.once("value").then(function(snapshot) {
				// get the snapshot value
				var snapshotValue = snapshot.val();
				// if no values present, just add the user
				if (snapshotValue == undefined || snapshotValue == null) {
					loggedUser = addNewUser(result, profileRef);
				}
				else {
					// iterate through the object, and determine if the
					// profile is present
					var keys = Object.keys(snapshotValue);
					var found = false;
					for (var i = 0; i < keys.length; i++) {
						// accessing objects:
						// way 1: objectname.objectvalue
						// way 2: objectname['objectvalue']
						if (snapshotValue[keys[i]].email == result.user.email) {							
							// found the profile, access it
							loggedUser = snapshotValue[keys[i]];
							loggedUser.id = keys[i];
							found = true;
						}
					}					
					// profile is not found, add a new one
					if (!found) {
						loggedUser = addNewUser(result, profileRef);
					}
				}
				loadtopics(conversationRef, database);
				loadmyconversations(userconvsref);
					});
			}, function(error) {
			console.log("Oops! There was an error");
			console.log(error);
		});
	});
// logout button
	$("#btn-logout").click(function() {
		console.log("click");
		firebase.auth().signOut().then(function() {
			console.log("signed out");
			$("#window-login").show();
			$("#window-main").hide();
		}, function(error) {
		  	alert("Oops!  Couldn't log you out.  Here's why: "+error);
		});
});
// temp chat button
	$("#btn-new-chat").click(function() {
		console.log(overallaverage);
		var newchat={
			topic: $("#new-chat-topic").val(), 
			requesterrating: overallaverage,
			side: $("#new-chat-side").val(),
			rating: $("#new-chat-rating").val(),
			length: $("#new-chat-length").val(),
			accepted: false,
			members: [loggedUser.name]

		}

		var chatref=database.ref("/conversations");
		var pushedchat=chatref.push(newchat);
		currentconversation=newchat;
		currentconversation.id=pushedchat.key;
		console.log(loggedUser)
		console.log(currentconversation);
		var conversationsmembersref=database.ref("/conversationmembers").child(currentconversation.id);
		conversationsmembersref.push(loggedUser.id);

		var userconversationsref=database.ref("/userconversations");
		var pushedmember=userconversationsref.child(loggedUser.id).child(currentconversation.id).update({side:currentconversation.side,topic:currentconversation.topic,id:currentconversation.id});
		chatref.child(currentconversation.id).on("value",function(snapshot){
			var thevalues=snapshot.val();
			if(thevalues.accepted==true){
				currentconversation=thevalues;
				console.log(currentconversation);
				console.log(snapshot)
				currentconversation.id=snapshot.key;

				var clock = parseInt(currentconversation.length)*60;
						var timeinterval = setInterval(function(){
						$("#timer").html(clock);
						   	if(clock<=0){
						   	
						    clearInterval(timeinterval);

						   }
						   clock--;
						 },1000);

				$("#window-main").hide();
				$("#window-talk").show();
				loadmessages(database);	

			}
		});


/*  changed how we were sturcturing our data

		var membersref=database.ref("/conversationmembers");
		var pushedmember=membersref.child(currentconversation.id).push({side:currentconversation.side,topic:currentconversation.topic,id:currentconversation.id});
	*/	

		$("#current-channel-topic").html(currentconversation.topic);
		$("#current-channel-position").html(currentconversation.side);

	
	});



// end conversation button
	
	$("#btn-end").click(function() {
		$("#window-main").show();
		$("#window-talk").hide();		
	});




	$("#btn-logout").click(function() {
		console.log("click");
		firebase.auth().signOut().then(function() {
			console.log("signed out");
			$("#window-login").show();
			$("#window-main").hide();
		}, function(error) {
		  	alert("Oops!  Couldn't log you out.  Here's why: "+error);
		});
});

	$("#conversation-input").keypress(function(e){
		if(e.which==13){
			console.log(currentconversation);
			console.log(loggedUser);
			var messageref=database.ref("/conversationmessages");
			messageref.child(currentconversation.id).push(loggedUser.name+": "+$("#conversation-input").val());
			$("#conversation-input").val("");
			return false;
		}

	})


















//THIS IS NEW
// Pushing the ratings to firebase upon clicking the finish and submit button
$(".btn-submit").click(function() {
			var convoid=currentconversation.id;	
			var chatref=database.ref("/conversationmembers");
			var membersref=database.ref("/userconversations");


			chatref.child(convoid).once("value", function(snapshot){
				var theconversation=snapshot.val();
				var keys=Object.keys(theconversation);
				console.log(theconversation);
				for (var i=0; i<keys.length;i++){
					console.log(theconversation[keys[i]]);
					if(theconversation[keys[i]]!==loggedUser.id){
						membersref.child(theconversation[keys[i]]).child(convoid).update({
							knowledge: $("#chat-rating-knowledge").val(), 
							demeanor: $("#chat-rating-demeanor").val(), 
							humour: $("#chat-rating-humour").val(), 
							overall: $("#chat-rating-overall").val()


						});
					}
				}

				// currentconversation.id=convoid;
				// var pushedmember=membersref.child(loggedUser.id).push({knowledge:currentconversation.knowledge,demeanor:currentconversation.demeanor,humour:currentconversation.humour,overall:currentconversation.overall,id:currentconversation.id});	
				// $("#chat-rating-knowledge").html(currentconversation.knowledge);
				// $("#chat-rating-demeanor").html(currentconversation.demeanor);
				// $("#chat-rating-humour").html(currentconversation.humour);
				// $("#chat-rating-overall").html(currentconversation.overall);
				// $("#window-main").hide();
				// $("#window-talk").show();	
				// loadmessages(database);

			})
			
		});

















//this is the closure of the document.ready portion
});

// function to add a new user
// (this isn't in document ready because it doesn't need to be initialized)
function addNewUser(result, ref) {
	var user = {
		name: result.user.displayName,
		email: result.user.email
	};

	var newUser = ref.push(user);
	user.id = newUser.key;
	return user;
}

//
function loadtopics(ref, database){
	ref.on("value", function(snapshot){
		var topicsvalue= snapshot.val();
		console.log(topicsvalue);
		var keys=Object.keys(topicsvalue);
		$("#available-topics").html("");
		for (var i=0; i<keys.length;i++){
			if(topicsvalue[keys[i]].accepted==false){

				$("#available-topics").append(`
								<tr>
		                        <th scope="row">${topicsvalue[keys[i]].topic}</th>
		                        <td>${topicsvalue[keys[i]].requesterrating}</td>
		                        <td>${topicsvalue[keys[i]].side}</td>
		                        <td>${topicsvalue[keys[i]].rating}</td>
		                        <td>${topicsvalue[keys[i]].length}</td>
		                        <td>
		                        <button class="btn btn-block btn-join" data-id="${keys[i]}">Join</button>
		                        </td>

		                        </tr>
				`);	
			}
		}

		$(".btn-join").click(function() {
			var convoid=$(this).data("id");	
			var chatref=database.ref("/conversations");
			var membersref=database.ref("/userconversations").child(loggedUser.id);
			var conversationsmembersref=database.ref("/conversationmembers").child(convoid);
			conversationsmembersref.push(loggedUser.id);
			chatref.child(convoid).once("value", function(snapshot){
				var theconversation=snapshot.val();
				if (overallaverage>=theconversation.rating){
					currentconversation=theconversation;
					currentconversation.id=convoid;
						
					

					var newside="For";

					if (currentconversation.side=="For"){
						newside="Against";

					}
					currentconversation.side=newside;

					var pushedmember=membersref.child(currentconversation.id).update({side:newside,topic:currentconversation.topic,id:currentconversation.id});
					chatref.child(convoid).update({ 
						accepted:true
					});
					chatref.child(convoid).child("members").push(loggedUser.name);
					loadmessages(database);

						var clock = parseInt(currentconversation.length)*60;
						var timeinterval = setInterval(function(){
						$("#timer").html(clock);
						   	if(clock<=0){
						   	
						    clearInterval(timeinterval);

						   }
						   clock--;
						 },1000);

					$("#current-channel-topic").html(currentconversation.topic);
					$("#current-channel-position").html(currentconversation.side);
					$("#window-main").hide();
					$("#window-talk").show();	

				}
				else {
					alert("your rating is not high enough to join this conversation!");
				}

			})
			
		})
	});

}

function loadmyconversations(ref){
	ref.child(loggedUser.id).on("value", function(snapshot){
		var topicsvalue= snapshot.val();
		console.log(topicsvalue);
		var keys=Object.keys(topicsvalue);
		$("#my-conversations").html("");

		var knowledgetotal=0;
		var demeanortotal=0;
		var humourtotal=0;
		var overalltotal=0;
		var counter=0;


		for (var i=0; i<keys.length;i++){

			$("#my-conversations").append(`
						<tr>
                        <th scope="row">${topicsvalue[keys[i]].topic}</th>
                        <td>${topicsvalue[keys[i]].side}</td>
                        <td></td>
                        <td>${topicsvalue[keys[i]].knowledge}</td>
                        <td>${topicsvalue[keys[i]].demeanor}</td>
                        <td>${topicsvalue[keys[i]].humour}</td>
                        <td>${topicsvalue[keys[i]].overall}</td>

                        </tr>
		
			`);	
			if(topicsvalue[keys[i]].knowledge!==undefined){
				knowledgetotal+=parseInt(topicsvalue[keys[i]].knowledge);
				demeanortotal+=parseInt(topicsvalue[keys[i]].demeanor);
				humourtotal+=parseInt(topicsvalue[keys[i]].humour);
				overalltotal+=parseInt(topicsvalue[keys[i]].overall);
				counter++;
			}
// end of for loop is the curly below
		}
		if(counter>0){
			console.log('overalltotal');
			console.log(overalltotal);
			console.log(counter);
			var knowledgeaverage=knowledgetotal/counter;
			var demeanoraverage=demeanortotal/counter;	
			var humouraverage=humourtotal/counter;	
			overallaverage=overalltotal/counter;
		


			$("#my-conversations").append(`
						<tr>
                        <th>AVERAGE</th>
                        <td></td>
                        <td></td>
                        <td>${knowledgeaverage}</td>
                        <td>${demeanoraverage}</td>
                        <td>${humouraverage}</td>
                        <td>${overallaverage}</td>

                        </tr>
		
			`);	
		}
	});
}

function loadmessages(database){
	var ref=database.ref("/conversationmessages");
	ref.child(currentconversation.id).on("value", function(snapshot){
		var messagesvalue= snapshot.val();
		console.log(messagesvalue);
		var keys=Object.keys(messagesvalue);
		$("#conversation-window").html("");

		for (var i=0; i<keys.length;i++){

		$("#conversation-window").append(`
						<p>${messagesvalue[keys[i]]}</p>

		`);	
		}
	});
}