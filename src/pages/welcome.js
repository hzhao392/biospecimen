import { validateUser, siteFullNames, showAnimation, hideAnimation, errorMessage, removeAllErrors } from "./../shared.js";
import { userDashboard } from "./dashboard.js";
import { shippingDashboard } from "./shipping.js";
import { nonUserNavBar } from './../navbar.js'

export const welcomeScreen = async (auth, route) => {
    const user = auth.currentUser;
    if(!user) return;
    const name = user.displayName;
    showAnimation();
    const response = await validateUser();
    hideAnimation();
    if(response.code !== 200) return;
    welcomeScreenTemplate(name, response.data, auth, route);
}

const welcomeScreenTemplate = (name, data, auth, route) => {
    let template = '';
    template += `
        <div class="row align-center welcome-screen-div">
            <div class="col">WELCOME</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">Clinical Research Associate: ${name}</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">IHCS: ${siteFullNames[data.siteAcronym]}</div>
        </div>
        <div class="row welcome-screen-div">
            <div class="col">
                <label for="dashboardSelection" class="col-form-label">Select dashboard to use </label>
                <select required class="col form-control" id="dashboardSelection">
                    <option value="">-- Select dashbaord --</option>
                    <option value="clinical">Clinical Dashboard</option>
                    <option value="research">Research Dashboard</option>
                </select>
            </div>
        </div>
        <div class="row welcome-screen-btn-div">
            <div class="col"><button class="btn btn-outline-primary" id="btnParticipantSearch">Participant Search</button></div>
            <div class="col"><button class="btn btn-outline-secondary" id="btnSpecimenSearch">Specimen Search</button></div>
            <div class="col"><button class="btn btn-outline-warning" id="btnShipping">Shipping</button></div>
        </div>
    `;
    document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar(name);
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('contentBody').dataset.siteAcronym = data.siteAcronym;
    document.getElementById('contentHeader').innerHTML = '';

    document.getElementById('btnParticipantSearch').addEventListener('click', () => {
        removeAllErrors();
        const selection = document.getElementById('dashboardSelection');
        if(!selection.value) {
            errorMessage('dashboardSelection', 'Please select Clinical or Research dashboard', true);
            return;
        }
        document.getElementById('contentBody').dataset.workflow = selection.value;
        location.hash = '#dashboard';
    });

    document.getElementById('btnSpecimenSearch').addEventListener('click', () => {
        removeAllErrors();
        const selection = document.getElementById('dashboardSelection');
        if(!selection.value) {
            errorMessage('dashboardSelection', 'Please select Clinical or Research dashboard', true);
            return;
        }
        document.getElementById('contentBody').dataset.workflow = selection.value;
        window.history.replaceState({},'', './#dashboard');
        userDashboard(auth, route, true);
    });
    document.getElementById('btnShipping').addEventListener('click',  async () => {
        //window.history.replaceState({},'', './#shipping');
        location.hash = '#shipping';
        //console.log('LMAO')
        //shippingDashboard(auth, route, true);
    });
}
