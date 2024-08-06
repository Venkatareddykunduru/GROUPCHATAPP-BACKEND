// WebSocket setup
const showUsersButton = document.getElementById('showUsersButton');
const userListDropdown = document.getElementById('userListDropdown');
const loggedInUserId = parseInt(localStorage.getItem('userid'),10);

const token=localStorage.getItem('token');
console.log("this is token",token);
const socket = io('http://localhost:3000',{
    auth:{
        token:token
    }
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('newMessage', (message) => {
    if (message.groupId === currentGroupId) {
        const chatMessages = document.getElementById('chatMessages');
        createcard(message,chatMessages);
        // if(message.type=='noturl'){
        //     const messageDiv = document.createElement('div');
        //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: ${message.content}`;
        //     chatMessages.appendChild(messageDiv);
        // }else{
        //     const messageDiv = document.createElement('div');
        //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: `;
        //     const fileLink = document.createElement('a');
        //     fileLink.href = message.content;
        //     fileLink.textContent = 'File';
        //     fileLink.target = '_blank';
        //     messageDiv.appendChild(fileLink);
        //     chatMessages.appendChild(messageDiv);
        // }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        const storedMessages = JSON.parse(localStorage.getItem(`group_${currentGroupId}`)) || [];
        storedMessages.push(message);
        console.log('Added new Message to local storage');
        if(storedMessages.length>7){
            storedMessages.shift();
            console.log('Because the length of localsotrage is greater than 7 we remove 1st element');
        }
        localStorage.setItem(`group_${currentGroupId}`, JSON.stringify(storedMessages));     
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Not authenticated. Redirecting to login page.');
        window.location.href = 'login.html';
        return;
    }

    const groupList = document.getElementById('groupList');
    const chatMessages = document.getElementById('chatMessages');

    // Initial welcome message
    chatMessages.innerHTML = '<p>Welcome! Select a group to start chatting.</p>';

    // Load groups
    try {
        const response = await axios.get('http://localhost:3000/group/getgroups', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const groups = response.data.groups;
        console.log(groups);
        groupList.innerHTML = '';
        groups.forEach(group => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = group.name;
            listItem.addEventListener('click', () => switchGroup(group.id,group.name));
            groupList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error loading groups:', error);
    }
});

let currentGroupId = null;
let curuserstatus="no";

async function switchGroup(groupId,groupName) {
    if (currentGroupId !== null) {
        socket.emit('leaveGroup', currentGroupId);
    }
    currentGroupId = groupId;
    socket.emit('joinGroup', currentGroupId);

    const groupname=document.getElementById('groupName');
    groupname.textContent=groupName
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '';

    // Load messages from local storage
    const storedMessages = JSON.parse(localStorage.getItem(`group_${groupId}`)) || [];
    if (storedMessages.length > 0) {
        storedMessages.forEach(message => {
            createcard(message,chatMessages);
            // if(message.type=='noturl'){
            //     const messageDiv = document.createElement('div');
            //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: ${message.content}`;
            //     chatMessages.appendChild(messageDiv);
            // }else{
            //     const messageDiv = document.createElement('div');
            //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: `;
            //     const fileLink = document.createElement('a');
            //     fileLink.href = message.content;
            //     fileLink.textContent = 'File';
            //     fileLink.target = '_blank';
            //     messageDiv.appendChild(fileLink);
            //     chatMessages.appendChild(messageDiv);
            // }
        });
    }

    // Query backend for new messages
    try {
        const token = localStorage.getItem('token');
        const lastMessageId = storedMessages.length > 0 ? storedMessages[storedMessages.length - 1].id : -1;
        const response = await axios.get(`http://localhost:3000/message/getmessages`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
                groupId,
                id: lastMessageId
            }
        });
        const newMessages = response.data.messages;
        console.log('new messages are : ',newMessages);
        if (newMessages.length > 0) {
            newMessages.forEach(message => {
                createcard(message,chatMessages);
                // if(message.type=='noturl'){
                //     const messageDiv = document.createElement('div');
                //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: ${message.content}`;
                //     chatMessages.appendChild(messageDiv);
                // }else{
                //     const messageDiv = document.createElement('div');
                //     messageDiv.textContent = `${new Date(message.createdAt).toLocaleString()} - ${message.username}: `;
                //     const fileLink = document.createElement('a');
                //     fileLink.href = message.content;
                //     fileLink.textContent = 'File';
                //     fileLink.target = '_blank';
                //     messageDiv.appendChild(fileLink);
                //     chatMessages.appendChild(messageDiv);
                // }
                storedMessages.push(message);
                if(storedMessages.length>7){
                    storedMessages.shift();
                }
            });
            localStorage.setItem(`group_${groupId}`, JSON.stringify(storedMessages));
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}
// Handle sending messages
document.getElementById('messageForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    const files = fileInput.files;
    if (currentGroupId === null) return;
    if(message.trim()){
        try {
            socket.emit('sendMessage', currentGroupId, message);
            messageInput.value = ''; // Clear the input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }else{
        console.log('you are not sending any message');
    }
    if(files.length>0){
        const formData = new FormData();
        let fileUrls=[];
        for (const file of files) {
            formData.append('files', file);
        }
        try {
            const token=localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/message/uploadfile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            fileUrls = response.data.urls;
            console.log('Files uploaded:', fileUrls);
            for (const url of fileUrls) {
                await socket.emit('sendFile', currentGroupId, url);
            }
            
            fileInput.value = ''; // Clear the input field
        } catch (error) {
            fileInput.value='';
            alert('error uploading file');
            console.error('Error uploading files:', error);
        }
    }else{
        console.log('you are not sending any files');
    }
    

});


document.getElementById('createGroupForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const groupName = document.getElementById('creatinggroup').value;
    console.log('groupname : ',groupName);
    const token = localStorage.getItem('token');
    const groupList = document.getElementById('groupList');
    try {
        const response = await axios.post('http://localhost:3000/group/creategroup',{name:groupName}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const group = response.data.group;
        console.log(group);
        
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.textContent = group.name;
        listItem.addEventListener('click', () => switchGroup(group.id));
        groupList.appendChild(listItem);
        const modal = bootstrap.Modal.getInstance(document.getElementById('createGroupModal'));
        modal.hide();
        alert('group created');
        
    } catch (error) {
        console.error('Error loading groups:', error);
        const modal = bootstrap.Modal.getInstance(document.getElementById('createGroupModal'));
        modal.hide();
        alert('group not created');
    }
    
});

//get users


async function fetchAndDisplayUsers() {
    try {
        const token=localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/group/getusers', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { groupId: currentGroupId } 
        });
        const users = response.data.users;
        curuserstatus = response.data.curuserstatus;
        console.log('curuserstatus ',curuserstatus);

        userListDropdown.innerHTML = ''; // Clear existing content

        users.forEach(user => {
            const listItem = document.createElement('div');
            listItem.className = 'dropdown-item';
            listItem.dataset.userId = user.id; // Store user ID for easy access
            listItem.innerHTML = `
                <span>${user.name}</span>
                <div class="float-right">
                    <button class="btn btn-sm btn-outline-success ml-2" onclick="handleAdminToggle(this, ${user.id}, '${user.usergroup.isadmin}')">
                        ${user.usergroup.isadmin === 'yes' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button class="btn btn-sm btn-outline-danger ml-2" onclick="handleRemoveUser(this, ${user.id})">
                        Remove User
                    </button>
                </div>
            `;
            userListDropdown.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Function to handle making a user admin or removing admin status
async function handleAdminToggle(button, userId, currentStatus) {
    if(curuserstatus=='no'){
        alert('you are not an admin');
        return;
    }
    try {
        const newStatus = currentStatus === 'yes' ? 'no' : 'yes';
        const token=localStorage.getItem('token');
        await axios.post('http://localhost:3000/group/makeadmin', { groupId: currentGroupId, userId, newStatus },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        alert('admin status for selected user changed');
        
        // Update the button text and action
        button.textContent = newStatus === 'yes' ? 'Remove Admin' : 'Make Admin';
    } catch (error) {
        console.error('Error toggling admin status:', error);
    }
}

// Function to handle removing a user from the group
async function handleRemoveUser(button, userId) {
    if(curuserstatus=='no'){
        alert('you are not an admin');
        return;
    }
    try {
        await axios.post('http://localhost:3000/group/removeuserfromgroup', { groupId: currentGroupId, userId },
            {headers: { 'Authorization': `Bearer ${token}` }}
        );
        alert('user removed successfully');
    } catch (error) {
        console.log('Error removing user:', error);
        alert(`${error.response.data.message}`);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const userid=document.getElementById('userId').value;
    const userId=parseInt(userid,10);
    
    console.log('the user id is: ',userId);
    console.log('the type of userid is: ',typeof userId);
    try {
        const response = await axios.post('http://localhost:3000/group/addusertogroup',{userId,groupId:currentGroupId}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('user added succesfully to group');
        
        let modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        
    } catch (error) {
        let modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
        modal.hide();
        console.log(error);
        alert(`userId ${error.response.data.message}`);
    }
    
});

function createcard(message,chatMessages){
    const messageCard = document.createElement('div');
    messageCard.classList.add('card', 'mb-2');
    messageCard.style.maxWidth = '75%';
    messageCard.classList.add(message.userId === loggedInUserId ? 'ml-auto' : 'mr-auto');
    console.log('type of loggedinuseid ',typeof loggedInUserId);
    if(message.userId===loggedInUserId){
        console.log('true');
    }else{
        console.log('false');
    }
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('card-header', 'text-left');
    messageHeader.textContent = message.username;
    
    const messageBody = document.createElement('div');
    messageBody.classList.add('card-body');
    if (message.type == 'noturl') {
        messageBody.textContent = message.content;
    } else {
        const fileLink = document.createElement('a');
        fileLink.href = message.content;
        fileLink.textContent = message.filename;
        fileLink.target = '_blank';
        messageBody.appendChild(fileLink);
    }

    const messageFooter = document.createElement('div');
    messageFooter.classList.add('card-footer', 'text-right');
    messageFooter.textContent = new Date(message.createdAt).toLocaleString();

    messageCard.appendChild(messageHeader);
    messageCard.appendChild(messageBody);
    messageCard.appendChild(messageFooter);

    chatMessages.appendChild(messageCard);
}
showUsersButton.addEventListener('click',fetchAndDisplayUsers);