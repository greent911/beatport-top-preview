export default function ajaxRequest(url, method, json) {
  let request = new XMLHttpRequest();
    
  return new Promise(function(resolve, reject) {
    request.onreadystatechange = function() {
      // Only run if the request is complete
      if (request.readyState !== 4) return;
      if (request.status >= 200 && request.status < 300) {
        resolve(request);
      } else {
        reject({
          status: request.status,
          statusText: request.statusText
        });
      }
    };

    // Set up HTTP request
    request.open(method || 'GET', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    // Send the request
    request.send(JSON.stringify(json));
  });
}