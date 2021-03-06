import { allStates } from 'https://episphere.github.io/connectApp/js/shared.js';
import { userAuthorization, removeActiveClass, addEventBarCodeScanner, storeBox, getBoxes, getAllBoxes, getBoxesByLocation, hideAnimation, showAnimation, showNotifications, getPage} from "./../shared.js"
import { addEventSearchForm1, addEventBackToSearch, addEventSearchForm2, addEventSearchForm3, addEventSearchForm4, addEventSelectParticipantForm, addEventAddSpecimenToBox, addEventNavBarSpecimenSearch, populateSpecimensList, addEventNavBarShipment, addEventNavBarBoxManifest, populateBoxManifestTable, populateBoxManifestHeader, populateSaveTable, populateShippingManifestBody,populateShippingManifestHeader, addEventNavBarShippingManifest, populateTrackingQuery, addEventCompleteButton, populateFinalCheck, populateBoxSelectList, addEventAddBox,addEventBoxSelectListChanged, populateModalSelect, addEventCompleteShippingButton, populateSelectLocationList, addEventChangeLocationSelect, addEventModalAddBox, populateTempNotification, populateTempCheck, populateTempSelect, addEventNavBarTracking, addEventReturnToShippingManifest, populateCourierBox} from "./../events.js";
import { homeNavBar, bodyNavBar, shippingNavBar} from '../navbar.js';

const conversion = {
    "299553921":"0001",
    "703954371":"0002",
    "838567176":"0003",
    "454453939":"0004",
    "652357376":"0005",
    "973670172":"0006",
    "143615646":"0007",
    "787237543":"0008",
    "223999569":"0009",
    "376960806":"0011",
    "232343615":"0012",
    "589588440":"0021",
    "746999767":"0022",
    "857757831":"0031",
    "654812257":"0032",
    "958646668":"0013",
    "677469051":"0014",
    "683613884":"0024",
}

export const shippingDashboard = (auth, route, goToSpecimenSearch) => {  
    auth.onAuthStateChanged(async user => {
        if(user){
            const role = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if(!role) return;
            startShipping(user.displayName ? user.displayName : user.email);
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}


export const startShipping = async (userName) => {
    showAnimation();
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    let response = await  getBoxes();
    let boxJSONS = response.data;
    let hiddenJSON = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['132929440']] = box['bags']
    }

    response = await  getAllBoxes();
    boxJSONS = response.data;
    let hiddenJSON1 = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON1[box['132929440']] = box['bags']
    }
    
    /*
    if(document.getElementById('shippingHiddenTable') != null){
        hiddenJSON = JSON.parse(document.getElementById('shippingHiddenTable').innerText);
    }
*/
    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        
        <div class="row">
            <div class="col-lg">
                Choose your shipping location
            </div>
        </div>
        <div class="row" style="margin-bottom:10px">
            <div class = "col-lg">
                <select class="selectpicker" id="selectLocationList">
                </select>
            </div>
        </div>

        <div class="row">
            <div class="col-lg">
            To start packing the shipping boxes, scan specimen bag ID or Full Specimen ID here:
                <div class="row form-row">
                    <form id="addSpecimenForm" method="POST" style="width:100%;">
                        <div class="form-group">
                            <input class="form-control" required type="text" id="masterSpecimenId" placeholder="Enter/Scan"/> <button class="barcode-btn" type="button" id="masterSpecimenIdBarCodeBtn" data-barcode-input="masterSpecimenId"><i class="fas fa-barcode"></i></button>
                        </div>
                    </form>
                    <button href="#" id="submitMasterSpecimenId" type="submit" class="btn btn-outline-primary" data-toggle="modal" data-target="#shippingModal" data-backdrop="static" style = "display:none">Add specimen to box</button>
                    <button href="#" id="submitSpecimenIdProxyButton" type="submit" class="btn btn-outline-primary" data-toggle="modal" data-target="#shippingModal" data-backdrop="static" style = "display:none">Add specimen to box</button>
                </div>
            </div>
        </div>
        <div class="row">
            
        </div>
        <div class="row">
    <div class="col-5">
    <div class="panel panel-default" style="border-style:solid;height:400px;border-width:1px;overflow:auto;" id="specimenPanel">
            <table class = "table" style="width: 100%;margin-bottom:0px;" id="specimenList" >
                <tr>
                    <th>Specimen Bag ID</th>
                    <th># Specimens in Bag</th>
                </tr>
            </table>
    </div>
    <div class="panel panel-default" style="border-style:solid;height:150px;border-width:1px;overflow:auto;margin-top:50px" id="orphansPanel">
            <table class = "table" style="width: 100%; margin-bottom:0px;" id="orphansList" >
                
            </table>
    </div>
    </div>
    <div class="col-7">
        <div class="row" style="margin-bottom:10px;">
            <div class="col" style="width:50%;float:left;">
                <select class="selectpicker" id="selectBoxList">
                </select>
            </div>
            <div class="col" style="width:50%;">
                <button type="button" class="btn btn-primary" style="float:right;" id="addBoxButton">Create New Box</button>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="panel panel-default" style="border-style:solid;height:550px;border-width:1px;overflow:auto">
                    <table style="width: 100%;" id="currTubeTable">
                    </table>
                </div>
            </div>
        </div>
    </div>



    

    <!-- The Modal -->
    <div class="modal fade" id="shippingModal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content sub-div-shadow">
                <div class="modal-header" id="shippingModalHeader"></div>
                <div class="modal-body" id="shippingModalBody">
                </div>
                <div class="modal-body"> 
                    <h4>Select Box<h4>
                    <select class="selectpicker" id="shippingModalChooseBox"></select>
                    <button type="button" class="btn btn-primary" id="modalAddBoxButton">Create New Box</button>
                    
                </div>
                <div class="modal-footer">
                   
                    <button type="button" class="btn btn-primary" data-dismiss="modal" id="addToBagButton">Add to Box</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" id="shippingModalCancel">Cancel</button>
                </div>  
            </div>
        </div>
    </div>
</div>

    </br>
    <div id="tempTubeReminder" style="color:red;display:none;">
        <p>
            Please put a temperature monitor in the box for shipping
        </p>
    </div>
    <div id="edit">
            <table  class="table" style="width:100%;border:1px solid;" id = "saveTable">
                <tr>
                    <th>To Ship</th>
                    <th>Started</th>
                    <th>Last Modified</th>
                    <th>Box Number</th>
                    <th>Contents</th>
                    <th>View/Print Box Manifest</th>
                </tr>
            </table>
    </div>
    <div class="row" id="checkForTemp">
        <div class="col-lg">
            <input type="checkbox" id="tempMonitorChecked" style="transform: scale(1.5); margin-right:10px; margin-top:5px;">
            <label for="tempMonitorChecked">Temp Monitor is included in this shipment</label><br>
        </div>
    </div>
    <div class="row" style="margin-top:50px;margin-bottom:50px;">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;">
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging" style="margin:auto;display:block;">Review/Ship</button>
            </div>
        </div>

    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShippingDash');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateSelectLocationList();
    
    await populateSaveTable(hiddenJSON, boxJSONS, userName);
    await populateSpecimensList(hiddenJSON1);

    let currLocation = document.getElementById('selectLocationList').value;

    response = await getBoxesByLocation(currLocation);
    boxJSONS = response.data;
    let hiddenJSONLocation = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSONLocation[box['132929440']] = box['bags']
    }
    await populateBoxSelectList(hiddenJSONLocation,userName);
    await populateTempNotification();
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarShippingManifest(userName, document.getElementById('tempMonitorChecked').checked);
    addEventAddBox(userName);
    addEventBoxSelectListChanged();
    addEventNavBarBoxManifest("navBarBoxManifest", userName)
    addEventChangeLocationSelect(userName);
    addEventAddSpecimenToBox(userName);
    addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 14, 0);
    addEventModalAddBox(userName);
    hideAnimation();
    //addEventSubmitAddBag();
    
}

export const boxManifest = async (boxId, userName) => {    
    showAnimation();
    let response = await  getBoxes();
    let boxJSONS = response.data;

    let currBox = {}
    let hiddenJSON = {};
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        if(box['132929440'] == boxId){
            currBox = box;
        }
        hiddenJSON[box['132929440']] = box['bags']
    }
    let currInstitute = currBox.siteAcronym;
    let currLocation = currBox['560975149'];
   

    let template = `
        </br>
        <div id="shippingHiddenTable" style="display:none">
            <table>

            </table>
        </div>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <p>Site: ` + currInstitute + `</p>
                <p>Location: ` + currLocation + `</p>
            </div>
        </div>
        <div class="row">
            <table id="boxManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Type/Color</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
                </tr>
            </table>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
            </div>
        </div>
        `;
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarBoxManifest');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
   

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(hiddenJSON);
    
    //addEventNavBarShipment("returnToPackaging");
    //document.getElementById('boxManifestTable').appendChild(result);
    populateBoxManifestHeader(boxId,boxJSONS);
    populateBoxManifestTable(boxId,hiddenJSON);
    addEventNavBarShipment("returnToPackaging", userName);
    document.getElementById('printBox').addEventListener('click', e => {
        window.print();
    });
    addEventNavBarShipment("returnToPackaging", userName);
    //addEventNavBarShippingManifest();
    hideAnimation();
    //addEventNavBarShipment("navBarShippingDash");
    //addEventSelectParticipantForm();
    //addEventBackToSearch('backToSearch');
}



export const shippingManifest = async (boxesToShip, userName, tempMonitorThere) => {    


    //let tempMonitorThere = document.getElementById('tempMonitorChecked').checked;
    

    let response = await  getBoxes();
    let boxJSONS = response.data;
    let hiddenJSON = {};
    let locations = {};
    let site = '';
    for(let i = 0; i < boxJSONS.length; i++){
        let box = boxJSONS[i]
        hiddenJSON[box['132929440']] = box['bags']
        locations[box['132929440']] = box['560975149'];
        site = box['siteAcronym'];
    }

    let toDisplayJSON = {};
    let location = ''
    for(let i = 0; i < boxesToShip.length; i++){
        let currBox = boxesToShip[i];
        toDisplayJSON[currBox] = hiddenJSON[currBox];
        location = locations[currBox];
    }

    let template = `
        </br>
        <div id="shippingHiddenTable" style="display:none">
            <table>

            </table>
        </div>
        <div class="row">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
            </div>
            <div style="float: left;width: 33%;"></div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
            </div>
        </div>
        <div class="row">
            <table id="shippingManifestTable" style="width: 100%;">
                <tr>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Box Number</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Specimen Bag ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Full Specimen ID</th>
                    <th style="padding-top: 12px;padding-bottom: 12px;text-align: left;">Scanned By</th>
                </tr>
            </table>
        </div>
        <div class="row" id="checkForTemp" style="display:none">
            <input type="checkbox" id="tempMonitorChecked">
            <label for="tempMonitorChecked">Temp Monitor is included in this shipment</label><br>
        </div>
        <div class="row" style="display:none" id="tempCheckList">
            <p>Select the box that contains the temp monitor</p>
            <select name="tempBox" id="tempBox">
            </select>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Full Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging">Continue</button>
            </div>
        </div>
        
        `;
        /*
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Return to Packaging</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="printBox">Print Box Manifest</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completePackaging">Packaging Complete</button>
            </div>
        </div>
        `;*/
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarShippingManifest');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    if(tempMonitorThere){
        populateTempSelect(boxesToShip);
    }

    document.getElementById('shippingHiddenTable').innerHTML = JSON.stringify(hiddenJSON);
    
    
    //document.getElementById('boxManifestTable').appendChild(result);
    
    populateShippingManifestHeader(toDisplayJSON, userName, location, site);
    populateShippingManifestBody(toDisplayJSON);
    addEventNavBarShipment("navBarShippingDash", userName);
    await populateTempCheck();
    const btn = document.getElementById('completePackaging');
    document.getElementById('printBox').addEventListener('click', e => {
        window.print();
    });
    addEventNavBarShipment('returnToPackaging', userName);

    

    document.getElementById('completePackaging').addEventListener('click', e => {
        e.stopPropagation();
        if(btn.classList.contains('active')) return;
        if(tempMonitorThere && document.getElementById('tempBox').value == '') {
            showNotifications({title: 'Missing field!', body: 'Please enter the box where the temperature monitor is being stored.'}, true)
            return;
        }
        //let currChecked = document.getElementById('tempMonitorChecked').checked;
        let currChecked = false;
        if(tempMonitorThere){
            currChecked = document.getElementById('tempBox').value;
        }
        //return box 1 info
        shipmentTracking(toDisplayJSON, userName, currChecked);
    });
    //addEventNavBarShipment("navBarShippingDash");
    //addEventSelectParticipantForm();
    //addEventBackToSearch('backToSearch');
}


export const shipmentTracking = async (hiddenJSON, userName, tempCheckChecked) => {
    showAnimation();

    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    
    /*
    let hiddenJSON = {};
    if(document.getElementById('shippingHiddenTable') != null){
        hiddenJSON = JSON.parse(document.getElementById('shippingHiddenTable').innerText);
    }
*/



    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg">
                Choose Shipment Courier
                </br>
                <select name="courier" id="courierSelect">
                </select>
            </div>
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg">
                Shipment Tracking Numbers:
                </br>
                <div class="col-lg" id="forTrackingNumbers">
                    
                </div>
            </div>
        </div>
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToShipping">Back To Packaging Dashboard</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Home</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="completeTracking">Continue</button>
            </div>
        </div>

    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2>Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarShipmentTracking');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    await populateCourierBox();
    addEventNavBarShipment("returnToPackaging", userName);
    if(Object.keys(hiddenJSON).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON)
    }
    addEventReturnToShippingManifest('returnToShipping', hiddenJSON, userName, tempCheckChecked)
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventReturnToShippingManifest('navBarShippingManifest', hiddenJSON, userName, tempCheckChecked)
    populateTrackingQuery(hiddenJSON);
    addEventCompleteButton(hiddenJSON, userName, tempCheckChecked);
    //addEventCompleteShippingButton(hiddenJSON);
    //addEventBackToSearch('navBarShippingDash');
    addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    hideAnimation();
    //addEventSubmitAddBag();
}

export const finalShipmentTracking = (hiddenJSON, userName, tempChecked, shipmentCourier) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let conversion = {
        '712278213': 'FedEx',
        '149772928': 'World Courier'
    }
    //store a secret json that has all of the packed ones in it
    //{"Box1":{specimenId:[allTubes], specimenId:[allTubes]}}
    let template = `
        <div id="shippingHiddenTable" style="display:none">
        {}
        </div>
        <div class="row" style="margin-top:40px">
            <div class="col-lg" id="numBoxes">
            </div>
        </div>
        <div class="row" style="margin-top:50px">
            <p>Shipment Courier: ` + shipmentCourier + `</p>
        </div>
        <div class="row" style="margin-top:10px">
            
            <p>Verify Tracking Numbers:</p>
        </div>
        <div class="row" style="margin-top:10px">
            <table id="finalCheckTable" style="width:100%">
                <tr>
                    <th>Box</th>
                    <th>Tracking Number</th>
                    <th>Number of tubes in shipment</th>
                    <th>Number of bags in shipment</th>
                </tr>
            </table>
        </div>
        
        <div class="row" style="margin-top:100px">
            <div style="float: left;width: 33%;" id="boxManifestCol1">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToTracking">Back to Tracking</button>
            </div>
            <div style="float: left;width: 33%;">
                <button type="button" class="btn btn-primary" data-dismiss="modal" id="returnToPackaging">Home</button>
            </div>
            <div style="float:left;width: 33%;" id="boxManifestCol3">
                <button type="button" class="btn btn-primary"  data-toggle="modal" data-target="#finalizeModal" id="completeShippingButton">Finalize</button>
            </div>
        </div>

        <!-- The Modal -->
        <div class="modal fade" id="finalizeModal" data-keyboard="false" data-backdrop="static" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content sub-div-shadow">
                    <div class="modal-header" id="finalizeModalHeader">
                        This will finalize the shipment
                    </div>
                    <div class="modal-body" id="finalizeModalBody">
                        
                    </div>
                    <div class="modal-body"> 
                        <h4>Please enter your name here to indicate this shipment is finalized. Once signed, no changes can be made to the shipment details.<h4>
                        <input type="text" id="finalizeSignInput">
                        </input>
                        <p id="finalizeModalError" style="color:red;display:none;">
                            *Please type in "` + userName + `"
                        </p>
                    </div>
                    <div class="modal-footer">
                    
                        <button type="button" class="btn btn-primary" id="finalizeModalSign">Sign</button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="finalizeModalCancel">Close</button>
                    </div>  
                </div>
            </div>
        </div>


    `;
    /*var x = document.getElementById("specimenList");
    var option = document.createElement("option");
    option.text = "Kiwi";
    x.add(option);*/
    
    
    removeActiveClass('navbar-btn', 'active')
    document.getElementById('contentHeader').innerHTML = `<h2 >Connect for Cancer Prevention Study</h2></br>` + shippingNavBar();
    const navBarBtn = document.getElementById('navBarSummaryAndReview');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    
    addEventNavBarShipment("returnToPackaging", userName);
    addEventNavBarShipment("navBarShippingDash", userName);
    addEventNavBarTracking("returnToTracking", userName, hiddenJSON, tempChecked)
    addEventNavBarTracking("navBarSummaryAndReview", userName, hiddenJSON, tempChecked)
    if(Object.keys(hiddenJSON).length > 0){
        document.getElementById('shippingHiddenTable').innerText = JSON.stringify(hiddenJSON)
    }
    populateFinalCheck(hiddenJSON);
    addEventReturnToShippingManifest('navBarShippingManifest', hiddenJSON, userName)
    addEventCompleteShippingButton(hiddenJSON, userName, tempChecked, shipmentCourier);
    addEventBackToSearch('navBarShippingDash');
    //addEventBackToSearch('navBarShippingDash');
    //addEventBarCodeScanner('masterSpecimenIdBarCodeBtn', 0, 9, 0);
    //addEventSubmitAddBag();
}