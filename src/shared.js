import { userNavBar, adminNavBar, nonUserNavBar, homeNavBar } from "./navbar.js";
import { searchResults } from "./pages/dashboard.js";
import { addEventHideNotification } from "./events.js"

const api = 'https://us-central1-nih-nci-dceg-episphere-dev.cloudfunctions.net/biospecimen?';
// const api = 'http://localhost:8010/nih-nci-dceg-episphere-dev/us-central1/biospecimen?';

export const validateUser = async () => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=validateUsers`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const findParticipant = async (query) => {
    const idToken = await getIdToken();
    const response = await fetch(`${api}api=getParticipants&type=filter&${query}`, {
        method: "GET",
        headers: {
            Authorization:"Bearer "+idToken
        }
    });
    return await response.json();
}

export const getIdToken = () => {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                user.getIdToken().then((idToken) => {
                    resolve(idToken);
            }, (error) => {
                resolve(null);
            });
            } else {
            resolve(null);
            }
        });
    });
};

export const showAnimation = () => {
    if(document.getElementById('loadingAnimation')) document.getElementById('loadingAnimation').style.display = '';
}

export const hideAnimation = () => {
    if(document.getElementById('loadingAnimation')) document.getElementById('loadingAnimation').style.display = 'none';
}

export const userAuthorization = async (auth, route) => {
    showAnimation();
    const response = await validateUser();
    hideAnimation();
    if(response.code === 200) {
        const role = response.data.role;
        if(role === 'admin') document.getElementById('navbarNavAltMarkup').innerHTML = adminNavBar();
        else document.getElementById('navbarNavAltMarkup').innerHTML = userNavBar();
        toggleCurrentPage(route);
        return role;
    }
    else if(response.code === 401) {
        document.getElementById('navbarNavAltMarkup').innerHTML = nonUserNavBar();
        document.getElementById('root').innerHTML = 'You do not have required permission to access this dashboard';
        hideAnimation();
    }
}


export const toggleCurrentPage = async (route) => {
    const IDs = ['dashboard', 'manageUsers'];
    IDs.forEach(id => {
        const element = document.getElementById(id);
        if(!element) return;
        element.addEventListener('click', () => {
            removeActiveClass('navbar-nav', 'current-page');
            element.parentNode.parentNode.classList.add('current-page');
            toggleNavbarMobileView();
        });
    });

    if(route === '#dashboard') document.getElementById('dashboard') ? document.getElementById('dashboard').click() : '';
    else if(route === '#manage_users') document.getElementById('manageUsers') ? document.getElementById('manageUsers').click() : '';
}

export const removeActiveClass = (className, activeClass) => {
    let fileIconElement = document.getElementsByClassName(className);
    Array.from(fileIconElement).forEach(elm => {
        elm.classList.remove(activeClass);
    });
}

export const toggleNavbarMobileView = () => {
    const btn = document.querySelectorAll('.navbar-toggler');
    if(btn && btn[0]){
        if(!btn[0].classList.contains('collapsed')) btn[0].click();
    }
}

export const performSearch = async (query) => {
    showAnimation();
    const response = await findParticipant(query);
    hideAnimation();
    if(response.code === 200 && response.data.length > 0) searchResults(response.data);
    else if(response.code === 200 && response.data.length === 0) showNotifications({title: 'Not found', body: 'The participant with entered search criteria not found!'})
}

export const showNotifications = (data) => {
    const div = document.createElement('div');
    div.classList = ["notification"];
    div.innerHTML = `
        <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="mr-auto">${data.title}</strong>
                <button type="button" class="ml-2 mb-1 close hideNotification" data-dismiss="toast" aria-label="Close">&times;</button>
            </div>
            <div class="toast-body">
                ${data.body}
            </div>
        </div>
    `
    document.getElementById('showNotification').appendChild(div);
    addEventHideNotification(div);
}