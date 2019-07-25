export default function ajaxRequest (url, method, json) {
  // Create the XHR request
  let request = new XMLHttpRequest();
    
  // Return it as a Promise
  return new Promise(function (resolve, reject) {
    // Setup our listener to process compeleted requests
    request.onreadystatechange = function () {
      // Only run if the request is complete
      if (request.readyState !== 4) return;
      // Process the response
      if (request.status >= 200 && request.status < 300) {
        // If successful
        resolve(request);
      } else {
        // If failed
        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    };
    // Setup our HTTP request
    request.open(method || 'GET', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    // Send the request
    request.send(JSON.stringify(json));
  });
}