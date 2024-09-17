console.log("Imported scripts!");
// Init settings
var settings = {
    "Statistics": { "ShowTasksSubmitted": "ON" },
    "Notifications": { "TasksAvailable": "OFF", "TaskIsSubmitted": "OFF" },
    "Sounds": {
        "TaskIsSubmitted": { "status": "OFF", "loop": false, "SoundUrl": "" },
        "TasksAvailable": { "status": "OFF", "loop": false, "SoundUrl": "" }
    },
    "Timing": { "TimeCounterClock": "ON" },
    "Automation": {
        "AutoReload": { "status": "OFF", "time": 300 },
        "AutoSubmit": { "status": "ON", "startTime": 33, "endTime": 45 }
    },
    "DateTime": { "Timezone": "default" }
}

var AutoScroll = [
    { "name": "App Ads on Google Search", "behavior": "smooth", "pixels": 100, "status": "OFF" },
    { "name": "DSA Page Similarity", "behavior": "instant", "position": "center", "status": "ON" },
    { "name": "GLS Triggering", "behavior": "instant", "position": "center", "status": "ON" },
    { "name": "Keyword Query Relevance Evaluation", "behavior": "smooth", "pixels": 1000, "status": "ON" },
    { "name": "Lead_Dispute", "behavior": "smooth", "position": "end", "status": "ON" },
    { "name": "Play App Content Screenshot Eval", "behavior": "smooth", "position": "center", "status": "ON" },
    { "name": "Public Figures images", "behavior": "smooth", "pixels": 1000, "status": "OFF" },
    { "name": "Query and Mobile App Match Evaluation", "behavior": "smooth", "pixels": 1000, "status": "OFF" },
    { "name": "SemanticContainment", "behavior": "instant", "pixels": 1000, "status": "ON" },
    { "name": "Video Brand Mention Detection", "behavior": "smooth", "position": "bottom", "status": "ON" },
];

// Task title
var taskTitle = document.getElementsByClassName("taskTitle")[0];
taskTitle.classList.add("notranslate");

var currTaskType = null;

// Global variable
var headerContainer = document.getElementsByClassName("dense-header")[0];
var audioElement = document.createElement('audio');

// Submit button
var isSubmitBtnEnabled = false;
var timeCounterClockCounter = 0;
var isStartNewTask = false;

// Auto submit
var autoSubmitTime = 0;
var isCancelAutoSubmit = false;

// Auto reload
var autoReloadCounter = 0;
var isAutoReloadCounting = false;
var isCancelAutoReload = false;

// Task availanle
var isSentTaskVailableNoti = false;
var isCancelTasksAvailableNoti = false;
var isTasksAvailableNotiSoundPlaying = false;



// Worker
var blob = new Blob(["setInterval(function() {postMessage('');}, 1000); "]);
var counterWorker = new Worker(window.URL.createObjectURL(blob));

var blob2 = new Blob(["setInterval(function() {postMessage('');}, 50); "]);
var submitBtnWorker = new Worker(window.URL.createObjectURL(blob2));

// Worker
var blob3 = new Blob(["setInterval(function() {postMessage('');}, 1000); "]);
var autoScrollWorker = new Worker(window.URL.createObjectURL(blob3));

/********** FUCNTION **********/
// Function convert time
const convertTime = (second) => {
    if (second <= 0) { return "00:00"; }
    let time = "";
    let hour = parseInt(second / 3600);
    let min = parseInt((second % 3600) / 60);
    let sec = (second % 3600) % 60;
    if (hour > 0) { // Hour
        if (hour < 10 && hour >= 1) { time += "0" }
        time += hour + ":";
    }
    if (min < 10) { time += "0"; }// Minute
    time += min + ":";
    if (sec < 10) { time += "0"; }// Second
    time += sec;
    return time;
}
// Random number
const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===================== AUTO SCROLL =====================
// For others
const radioButtonClick = () => {
    let params = AutoScroll.find(x => currentTk.includes(x.name));
    //
    let cnt = document.getElementsByClassName("content")[3];
    setTimeout(() => {
        cnt.scrollTop = cnt.scrollHeight - parseInt(params.pixels);
    }, 100);
};

// For GLS
const radioButtonClickGLS = (event) => {
    let name = event.target.getAttribute("name");
    if (name == undefined) { return };

    // Set index of next question to scroll
    let ques = document.getElementsByClassName("ewoq-trigger-section");
    let idx = 0;
    if (name.startsWith("glsRelevance")) { idx = 2; }
    else if (name.startsWith("provider")) { idx = 3; }
    else if (name.startsWith("verticalCorrect")) { idx = 5; }

    // Scroll to next question
    let params = AutoScroll.find(x => currentTk.includes(x.name));
    setTimeout(() => { ques[idx].scrollIntoView({ behavior: params.behavior, block: params.position }); }, 100);
};

// Key work
const scaleClick = () => {
    let cnt = document.getElementsByClassName("content")[3];
    setTimeout(() => {
        cnt.scrollTop = cnt.scrollHeight - 1500
    }, 100)
};

// For Video brand
const radioButtonClickVideoBrand = (event) => {
    // Get current question name
    let name = event.target.getAttribute("name");
    if (name == undefined) { return };
    name = name.split("-")[0];

    // Get list of question name
    let btn = document.getElementsByClassName("ewoq-radio-button radioButtonQuestion");
    let arr = [];
    for (let i = 0; i < btn.length; i++) {
        if (i % 2 == 0) {
            let name = btn[i].getAttribute("name");
            name = name.split("-")[0];
            arr.push(name)
        }
    }

    // Find next question displayed and scroll
    let params = AutoScroll.find(x => currentTk.includes(x.name));
    let idx = arr.indexOf(name);
    setTimeout(() => {
        for (let i = idx + 1; i < arr.length; i++) {
            let nextQuestionName = arr[i];
            let nextQuestion = document.querySelector('ewoqtriggersection[question="' + nextQuestionName + '"]')
            if (nextQuestion.style.display != "none") {
                nextQuestion.scrollIntoView({ behavior: params.behavior, block: params.position });
                console.log(nextQuestionName)
                break;
            }
        }
    }, 100);
};

// Click event
autoScrollWorker.onmessage = async () => {
    currentTk = taskTit.innerText; // Get task title
    // AUTO SCROLL
    let items = await chrome.runtime.sendMessage({ getAllSettings: true });
    AutoScroll = items.AutoScroll;
    //
    for (let i = 0; i < AutoScroll.length; i++) {
        // Check
        if (!currentTk.includes(AutoScroll[i].name) || AutoScroll[i].status == "OFF") { continue; }

        // For GLS
        if (currentTk.includes("GLS Triggering")) { // For GLS
            let rg = 'ewoqradiobutton[name^="glsRelevance"][label="Yes"], ewoqradiobutton[name^="provider"], ewoqradiobutton[name^="verticalCorrect"][label="Yes"]';
            let arr = document.querySelectorAll(rg);
            for (let k = 0; k < arr.length; k++) {
                arr[k].addEventListener("click", radioButtonClickGLS);
            }
        }
        // For Video brand
        else if (currentTk.includes("Video Brand Mention Detection")) {
            let arr = document.getElementsByClassName("ewoq-radio-button radioButtonQuestion");
            for (let k = 0; k < arr.length; k++) {
                arr[k].addEventListener("click", radioButtonClickVideoBrand);
            }

            let text = document.getElementsByClassName("prompt")[1];
            if (text != undefined) {
                text.addEventListener("click", textVideoBrandClick)
            }

            let query1 = document.querySelector("[name='query1'] a");
            let query2 = document.querySelector("[name='query2'] a");
            if (query1 != undefined || query2 != undefined) {
                query1.href = query1.innerText;
                query2.href = query2.innerText;
            }

        }
        // For others
        else {
            let arr = document.getElementsByClassName("ewoq-radio-button radioButtonQuestion");
            for (let k = 0; k < arr.length; k++) {
                arr[k].addEventListener("click", radioButtonClick);
            }
            // Thanh 
            if (currentTk.includes("Keyword Query Relevance Evaluation")) {
                let scale = document.getElementsByClassName("ewoq-continuous-scale-track")[0];
                if (scale != undefined) {
                    scale.addEventListener("click", scaleClick);
                }
            }

        }
    }
};

// ===================== AUTO SCROLL =====================

// =========== AUTO COUNT Submit button ===========
// Check if submit button is enabled or not
submitBtnWorker.onmessage = () => {
    let submitButton = document.getElementsByClassName("submitTaskButton")[0];
    if (submitButton != undefined) {
        if (!submitButton.classList.contains("is-disabled")) {
            isSubmitBtnEnabled = true;
            checkNewTaskType();
            submitButton.removeEventListener("click", submitButtonClick);
            submitButton.addEventListener("click", submitButtonClick);
        }
        else {
            isSubmitBtnEnabled = false;
        }
    }
    else {
        isSubmitBtnEnabled = false;
    }
};


// Submit button click event
const submitButtonClick = () => {
    if (isSubmitBtnEnabled) {
        let submitData = { time: timeCounterClockCounter, taskType: currTaskType };

        // Send submit data
        isStartNewTask = true;
        resetTimeCounterClockCounter();
        // Send notification
        if (Notification.permission === 'granted' && settings.Notifications.TaskIsSubmitted) {
            new Notification('EWOQ', { body: 'Task submitted!', });
        }
        // Play sound
        if (settings.Sounds.TaskIsSubmitted.status == "ON") {
            let SoundURL = settings.Sounds.TaskIsSubmitted.SoundUrl;
            let au = document.createElement('audio');
            au.innerHTML = '<source src="' + SoundURL + '" type="audio/mpeg" />'
            au.play();
        }
    }
}
eventHandler = (e) => { if (e.keyCode == 13 && e.ctrlKey) { submitButtonClick() } }
window.addEventListener('keydown', eventHandler, false);


// =========== TASK TIME COUNTER ===========
const createTimeCounterClockBox = () => {
    let cssTaskTime = 'display:none; left: 42vw; top: 10px; width: fit-content; min-width: 100px; background-color: rgb(68, 68, 68); position: fixed; border-radius: 10px; justify-content: center; padding: 10px;'
    let timeCounterClockCounter = document.createElement("div");
    let taskTimeContent = '<div id="task-time" style="' + cssTaskTime + '">'
        + '<img src="https://w7.pngwing.com/pngs/971/269/png-transparent-clock-computer-icons-clock-cdr-text-time-thumbnail.png" alt="" style="height: 20px;padding-right: 5px;margin-top: 2px;">'
        + '<p id="txt-task-time" style="margin: 0; display: inline;color: white;margin-top: 4px">0</p>'
        + '</div>';
    timeCounterClockCounter.innerHTML = taskTimeContent;
    headerContainer.appendChild(timeCounterClockCounter);
}

const showTimeCounterClockBox = () => {
    // document.getElementById("txt-task-time").innerText = convertTime(timeCounterClockCounter);
    // document.getElementById("task-time").style.display = "flex";
    document.title = convertTime(timeCounterClockCounter) + " | Ewoq Rating Portal"
}

const hideTimeCounterClock = () => {
    document.getElementById("task-time").style.display = "none";
    document.title = "Ewoq Rating Portal"
}

const resetTimeCounterClockCounter = () => {
    isStartNewTask = true;
    isCancelAutoSubmit = false;
    timeCounterClockCounter = -1;
    // Reset auto submit time
    resetAutoSubmit();
}


//
const resetTaskType = () => { currTaskType = null; }
//
const checkNewTaskType = () => { currTaskType = taskTitle.innerText; }


// =========== AUTO SUBMIT COUNTER ===========
const createAutoSubmitBox = () => {
    let cssAtSb = 'left: 65vw; top: 10px; width: 150px; height: 93px; background-color: rgb(68, 68, 68); position: fixed; border-radius: 10px; text-align: center; padding: 9px 10px 9px 10px;'
    let autoSubmitBox = document.createElement("div");
    let autoSubmitBoxContent = '<div id="auto-submit-box" class="notranslate" style="display:none;' + cssAtSb + '">'
        + '<p style="color: white;margin-bottom: 5px;">'
        + 'Auto submit in <br> '
        + '<strong style="color: rgb(0, 217, 255);font-size: 15px;" id="txt-time-count-submit">0</strong></p>'
        + '<p type="button" style="cursor: pointer;margin-bottom: 5px;color: white;margin-top: 0px;font-weight: 800;text-shadow: 1px 1px #992400;" id="btn-cancel-auto-submit">CANCEL</p></div>';
    autoSubmitBox.innerHTML = autoSubmitBoxContent;
    headerContainer.appendChild(autoSubmitBox);
    let btn_cancel_auto_submit = document.getElementById("btn-cancel-auto-submit");
    btn_cancel_auto_submit.addEventListener("click", () => {
        isCancelAutoSubmit = true;
        hideAutoSubmitBox();
    })
}

const showAutoSubmitBox = (timeRemain) => {
    document.getElementById("txt-time-count-submit").innerText = convertTime(timeRemain);
    document.getElementById("auto-submit-box").style.display = "block";
}

const hideAutoSubmitBox = () => {
    document.getElementById("auto-submit-box").style.display = "none";
}

const resetAutoSubmit = () => { autoSubmitTime = 0; }


// =========== AUTO RELOAD COUNTER ===========
const createAutoReloadBox = () => {
    let autoReloadBox = document.createElement("div");
    let autoReloadBoxContent = '<div id="auto-reload-box" class="notranslate" style="display:none">'
        + '<div><p style="color: white;">'
        + '<img src="https://w7.pngwing.com/pngs/1/325/png-transparent-update-arrow-refresh-renew-synchronize-%D0%92asic-icon-thumbnail.png" alt="" style="height: 40px;"><br>'
        + '<strong style="color: rgb(0, 217, 255);font-size: 20px;" id="txt-time-count-reload">0</strong></p>'
        + '</div><div><p type="button" style="cursor: pointer;" id="btn-cancel-auto-reload">CANCEL</p></div></div>';
    autoReloadBox.innerHTML = autoReloadBoxContent;
    headerContainer.appendChild(autoReloadBox);
    let btn_cancel_auto_reload = document.getElementById("btn-cancel-auto-reload");
    btn_cancel_auto_reload.addEventListener("click", () => {
        isCancelAutoReload = true;
        hideAutoReloadBox();
        resetAutoReloadCounter();
    })
}

const showAutoReloadBox = (timeRemain) => {
    document.getElementById("txt-time-count-reload").innerText = convertTime(timeRemain);
    document.getElementById("auto-reload-box").style.display = "block";
}

const hideAutoReloadBox = () => {
    document.getElementById("auto-reload-box").style.display = "none";
}

const resetAutoReloadCounter = () => {
    autoReloadCounter = -1;
}

// =========== TASK AVAILABLE NOTI ===========
const createTaskAvailableNotiBox = () => {
    let notiBox = document.createElement("div");
    notiBox.innerHTML = '<div id="task-avail-noti-box" class="notranslate" style="display:none">'
        + '<div>'
        + '<p style="margin: 5px; display: inline;color: white; font-size: large;font-weight: 900;">Ting ting</p>'
        + '<br>'
        + '<br>'
        + '<p style="margin: 5px; display: inline;color: white;margin: 15px 0 10px 0;">There are tasks available!</p>'
        + '<br>'
        + '<img id="btn-close-task-noti" type="button" style="cursor: pointer;width: 50px;margin: 15px 0 10px 0;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQiI3dFXjZDqwT-jPtGIcZFT3rX5UjWdYOBA&s" alt="">'
        + '</div>'
        + '</div>';
    headerContainer.appendChild(notiBox);
    let btn_close_noti = document.getElementById("btn-close-task-noti");
    btn_close_noti.addEventListener("click", () => {
        isCancelTasksAvailableNoti = true;
        stopTasksAvailableNotiSound();
        hideTasksAvailableNotiBox();
    })

}

const showTasksAvailableNotiBox = () => {
    document.getElementById("task-avail-noti-box").style.display = "block";
}

const hideTasksAvailableNotiBox = () => {
    document.getElementById("task-avail-noti-box").style.display = "none";
}

const playTasksAvailableNotiSound = () => {
    if (isTasksAvailableNotiSoundPlaying == false) {
        let SoundURL = settings.Sounds.TasksAvailable.SoundUrl;
        let loop = settings.Sounds.TasksAvailable.loop;
        audioElement.innerHTML = '<source src="' + SoundURL + '" type="audio/mpeg" />'
        audioElement.play().then(() => {
            isTasksAvailableNotiSoundPlaying = true;
            audioElement.loop = loop;
        })
    }
}

const stopTasksAvailableNotiSound = () => {
    audioElement.pause();
    isTasksAvailableNotiSoundPlaying = false;
}

const sendMessToSystem = () => {
    if (Notification.permission === 'granted' && settings.Notifications.TasksAvailable) {
        new Notification('EWOQ', { body: 'Task available!', });
    }
}

// Create
createTimeCounterClockBox();
createAutoSubmitBox();
createAutoReloadBox();
createTaskAvailableNotiBox();


counterWorker.onmessage = async () => {
    let startButton = document.getElementsByClassName("start-button")[0];
    let requestAssignmentsButton = document.getElementsByClassName("request-assignments")[0];

    let continueButton = document.getElementsByClassName("continue-button")[0];
    let submitButton = document.getElementsByClassName("submitTaskButton")[0];
    let skipButton = document.getElementsByClassName("skip-button")[0];
    let takeABreakButton = document.getElementsByClassName("skip-and-take-a-break-button")[0];
    let finishButton = document.getElementsByClassName("finish-button")[0];

    // ======= EVENT =======
    if (startButton != null) { // start button
        startButton.removeEventListener("click", resetTimeCounterClockCounter);
        startButton.addEventListener("click", resetTimeCounterClockCounter);
    }
    if (continueButton != null) { // continue button
        continueButton.removeEventListener("click", resetTimeCounterClockCounter);
        continueButton.addEventListener("click", resetTimeCounterClockCounter);
    }
    if (skipButton != null) { // skip button
        skipButton.removeEventListener("click", resetTimeCounterClockCounter);
        skipButton.addEventListener("click", resetTimeCounterClockCounter);
    }
    if (takeABreakButton != null) { // take a break button
        takeABreakButton.removeEventListener("click", resetTimeCounterClockCounter);
        takeABreakButton.addEventListener("click", resetTimeCounterClockCounter);
    }
    if (finishButton != null) { // finish button
        finishButton.removeEventListener("click", resetTimeCounterClockCounter);
        finishButton.addEventListener("click", resetTimeCounterClockCounter);
    }

    //
    let Notifications = settings.Notifications;
    let Sounds = settings.Sounds;
    let Timing = settings.Timing;
    let Automation = settings.Automation;

    // ============ WAITING ============
    // Start
    if (startButton != null) {
        // Hide and reset count time clock
        hideTimeCounterClock();
        resetTimeCounterClockCounter();

        // Hide and reset auto submit
        hideAutoSubmitBox();

        // Reset state
        isStartNewTask = true;
        isCancelAutoSubmit = false;

        resetTaskType();

        // Tasks Available
        // === Tasks Available notification
        if (startButton.classList.contains("enabled")) {
            // Hide and reset auto reload
            hideAutoReloadBox();
            resetAutoReloadCounter();
            if (isCancelTasksAvailableNoti == false) { // Check is canceled noti or not
                // Create notification
                if (isSentTaskVailableNoti == false) { // Checked "ON"/"OFF" in backgound script
                    sendMessToSystem();
                    isSentTaskVailableNoti = true;
                }

                // Play audio
                if (Sounds.TasksAvailable.status == "ON") { playTasksAvailableNotiSound(); }
                else { stopTasksAvailableNotiSound(); }

                // Show noti box
                if (Notifications.TasksAvailable == "ON" || Sounds.TasksAvailable.status == "ON") {
                    showTasksAvailableNotiBox();
                }
            }
        }
        // No Tasks Available
        // === Auto Reload
        else {
            // Reset noti status
            isSentTaskVailableNoti = false;
            // Hide noti
            hideTasksAvailableNotiBox();
            // Stop audio
            stopTasksAvailableNotiSound();

            // Auto reload
            if (Automation.AutoReload.status == "OFF" || Automation.AutoReload.time <= 0 || isCancelAutoReload == true) { // Hide if status is "OFF"
                hideAutoReloadBox();
                resetAutoReloadCounter();
            }
            // If status is "ON"
            else if (isCancelAutoReload == false) { // Check cancel
                // Reset counter If is not counting 
                if (isAutoReloadCounting == false) { resetAutoReloadCounter(); }
                // Countdown and show
                autoReloadCounter += 1;
                isAutoReloadCounting = true;
                let timeAutoReload = Automation.AutoReload.time;
                let timeRemain = timeAutoReload - autoReloadCounter;
                showAutoReloadBox(timeRemain);
                // Reload if 
                if (timeRemain == 0) { window.location.reload(); }
            }

        }
        return
    }

    // Take A Break
    if (requestAssignmentsButton != null) {
        // Hide and reset count time clock
        hideTimeCounterClock();
        resetTimeCounterClockCounter();

        // Hide and reset auto submit
        hideAutoSubmitBox();

        // Hide Task Available notification
        // Hide noti
        hideTasksAvailableNotiBox();
        // Stop audio
        stopTasksAvailableNotiSound();

        // Hide and reset auto reload
        hideAutoReloadBox();
        resetAutoReloadCounter();

        // Reset state
        isStartNewTask = true;
        isCancelAutoSubmit = false;

        resetTaskType();

        return
    }


    // ============ IN TASK ============
    // Hide Task Available notification
    // Hide noti
    hideTasksAvailableNotiBox();
    // Stop audio
    stopTasksAvailableNotiSound();

    // Hide and reset auto reload
    hideAutoReloadBox();
    resetAutoReloadCounter();

    // Reset state
    isAutoReloadCounting = false;
    isCancelAutoReload = false;
    //
    isSentTaskVailableNoti = false;
    isCancelTasksAvailableNoti = false;
    isTasksAvailableNotiSoundPlaying = false;

    // ** Count time clock in Task, Instructions,...
    if (isStartNewTask == true) {
        resetTimeCounterClockCounter();
        isStartNewTask = false;
    }
    ++timeCounterClockCounter;

    // Show/hide count time clock
    if (Timing.TimeCounterClock == "ON" && finishButton == null) { showTimeCounterClockBox(); }
    else { hideTimeCounterClock(); }

    // ** Auto submit
    if (Automation.AutoSubmit.status == "OFF" || Automation.AutoSubmit.endTime <= 0 || finishButton != null || continueButton != null || isCancelAutoSubmit == true) { hideAutoSubmitBox() }
    // If status is "ON"
    else if (isCancelAutoSubmit == false && finishButton == null && continueButton == null) { // Check cancel
        if (autoSubmitTime == 0) {
            autoSubmitTime = getRandomNumber(Automation.AutoSubmit.startTime, Automation.AutoSubmit.endTime);
        }

        let timeRemain = autoSubmitTime - timeCounterClockCounter;
        // console.log(autoSubmitTime)
        // console.log(timeRemain)
        showAutoSubmitBox(timeRemain)
        if (timeRemain <= 0) {
            isCancelAutoSubmit = true;
            if (submitButton != null) { submitButton.click() }
            hideAutoSubmitBox();
        }
    }
}
