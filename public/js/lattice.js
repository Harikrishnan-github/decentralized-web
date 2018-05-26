function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function compute(){
  $("#status").append("Get ready to experience awesomeness!");
  $("#status").append("<br/> > creating result-dataset > ")
  var uuid1 = uuidv4()
  $.post( "http://localhost:8189/v1/datasets/?uuid=" + uuid1, function( data ) {
    $("#status").append(data);
    $("#status").append("<br/> UUID = " + uuid1)
    var results = data

    $("#status").append("<br/> > creating split-status > ");
    $.post( "http://localhost:8189/v1/datasets/?uuid=" + uuidv4(), function( data ) {
      $("#status").append( data );
      var status = data

      $("#status").append("<br/> > creating split-task.json");
      var task = '{"input": {"dataset": "' + $("#sentiment").val() + '"},"taskDefinition": {"runner": {"type": "docker-json-runner","metadata": {"image": "computes/computes-sentiment:latest"}},"result": {"action": "set","destination": {"dataset": { "/": "' + results + '" },"path": "split/results"}}},"status": {"/": "' + status + '"}}'
      $("#status").append(task);

      $("#status").append("<br/> > adding task to Computes FS");
      $.post("http://localhost:3000/dag",{task: task}, function(data){
        $("#status").append("<br/> Task hash: " + data );
        var dag = data.dag

      // COMMENTED DUE TO JS-IPFS AND GO IPFS NOT YET COMMUNICATING
      // node.dag.put(task, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
      //   console.log(cid.toBaseEncodedString())
      //   var dag = cid.toBaseEncodedString()

        $("#status").append("<br/> > adding task to Lattice");
        fetch("http://localhost:8189/v1/tasks/" + dag, {
          method: 'PUT', // or 'PUT'
          headers:{
            'Content-Type': 'application/json'
          }
        }).then(function(res) {
          $("#status").append( res );

          var refreshIntervalId = setInterval(function(){
            $("#status").append("<br/> > computing");

            $.get( "http://localhost:8189/v1/datasets/" + results + "/latest", function( data ) {
              $("#status").append( JSON.stringify(data) );
              if(data.split) {
                clearInterval(refreshIntervalId);
              }
            })
          }, 1000);
        })
      })
    });
  });
};
