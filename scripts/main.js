

/**************************************
***** MODEL ***************************
***************************************/

function Note(id, body, time) {
	this.id = id;
	this.body = body;

	var d = new Date();
	this.time = time || d.getTime();
}

Note.prototype.copy = function() {
	return new Note(this.id, this.body, this.time);
}


/**************************************
***** CTL *****************************
***************************************/

function NoteCtl() {
	this.prevID = 0;
	this.notes = [];
	this.focusID = null;
}


NoteCtl.prototype.wireUp = function(view) {
	this.view = view;
}

NoteCtl.prototype.start = function() {
	if (localStorage["notes"]) {
		var notes = JSON.parse(localStorage["notes"]);
		for (i in notes) {
			var note = notes[i];
			this.prevID = Math.max(this.prevID, note.id)
			this.notes.push(new Note(note.id, note.body, note.time));
		}
	}
	this.view.start();
}

NoteCtl.prototype.findNoteIndexByID = function(id) {
	if (!_.isNumber(id)) { return; }
	for (note in this.notes) {
		if (this.notes[note].id === id) { return note; }
	}
	return -1;
}

NoteCtl.prototype.findNoteByID = function(id) {
	if (!_.isNumber(id)) { return; }
	for (note in this.notes) {
		if (this.notes[note].id === id) { return this.notes[note]; }
	}
	return null;
}

NoteCtl.prototype.saveNote = function(body) {
	if (this.focusID !== null) {
		var noteIndex = this.findNoteIndexByID(this.focusID);
		this.notes[noteIndex] = new Note(this.focusID,body);
	}
	else { this.notes.push(new Note(this.prevID+1,body)); this.prevID += 1; }

	this.focusID = null;
	this.view.refresh();
	localStorage["notes"] = JSON.stringify(this.notes);
}

NoteCtl.prototype.editNote = function(id) {
	if (!_.isNumber(id) && id !== null) { return; }
	this.focusID = id;
	this.view.refresh();
}

NoteCtl.prototype.removeNote = function() {
	var index = this.findNoteIndexByID(this.focusID);
	this.notes.splice(index, 1);
	this.focusID = null;
	this.view.refresh();
	localStorage["notes"] = JSON.stringify(this.notes);
}

NoteCtl.prototype.getNotes = function() {
	var notes = [];
	for (i in this.notes) {
		notes.push(this.notes[i].copy());
	}
	return notes;
}

NoteCtl.prototype.getFocusNote = function() {
	if (this.focusID === null) { return null; }
	var note = this.findNoteByID(this.focusID);
	return note.copy();
}


/**************************************
***** VIEW ****************************
***************************************/

function NoteView() {}

NoteView.prototype.wireUp = function(ctl) {
	this.ctl = ctl;
}

NoteView.prototype.start = function() {
	this.refresh();
	this.bindEventHandlers();
}

NoteView.prototype.refresh = function() {

	// refresh note editor
	var focusNote = this.ctl.getFocusNote();
	if (focusNote === null) {
		$("#editNoteBody").val("");
		$("#editNoteID").val("");
		$("#createButton").show();
		$("#saveButton").hide();
		$("#cancelButton").hide();
		$("#deleteButton").hide();
	}
	else {
		$("#editNoteBody").val(focusNote.body);
		$("#editNoteID").val(focusNote.id);
		$("#createButton").hide();
		$("#saveButton").show();
		$("#cancelButton").show();
		$("#deleteButton").show();
	}

	// refresh note list
	var notes = this.ctl.getNotes();
	notes = _.sortBy(notes, 'time').reverse();
	var html = "";
	for (i in notes) {
		var note = notes[i];
		var noteDate = new Date(note.time);
		var noteDateString = noteDate.toLocaleDateString() + " " + noteDate.toLocaleTimeString();
		if (focusNote !== null && focusNote.id == note.id) {
			html += '<li class="row well noteListItem list-group-item clickable active" data-id="'+note.id+'"><div class="col-xs-7 noteBody">'+note.body+'</div><div class="col-xs-5 text-right">'+noteDateString+'</div></li>';
		}
		else {
			html += '<li class="row well noteListItem list-group-item clickable" data-id="'+note.id+'"><div class="col-xs-7 noteBody">'+note.body+'</div><div class="col-xs-5 text-right">'+noteDateString+'</div></li>';
		}
	}
	if (html == "") {
		html = "No notes here..."
	}
	$("#noteList").html(html);
}

NoteView.prototype.bindEventHandlers = function() {
	var ctl = this.ctl;

	$('#noteList').on('click', '.noteListItem', function() {
		var id = parseInt($(this).attr("data-id"));
		$("#editNoteBody").focus();
		ctl.editNote(id);
	});

	$("#cancelButton").click(function () {
		ctl.editNote(null);
	});

	$("#deleteButton").click(function () {
		ctl.removeNote(null);
	});

	$("#saveButton, #createButton").click(function () {
		var body = $("#editNoteBody").val();
		ctl.saveNote(body);
	});
}


/**************************************
***** MAIN ****************************
***************************************/

function start() {
	var noteCtl = new NoteCtl();
	var noteView = new NoteView();
	noteCtl.wireUp(noteView);
	noteView.wireUp(noteCtl);
	noteCtl.start();
};

start();








