var _parameters = []
var funcs = {}

function getParameterDefinitions() {
    let keys = Object.keys(funcs);
    var index = _parameters.findIndex(p=>p.name == 'piece')
    if(keys.length > 1 && index == -1){    
      _parameters.push({
          name:'piece', 
          caption:'Piece', type:'choice',
          values: keys 
        });
    }

    if(index != -1) _parameters[index].values = keys;

    return _parameters;
}

function main(params){
  let keys = Object.keys(funcs);
  let piece = params.piece || keys[0];
  if(!funcs[piece]){ piece = keys[0]}
  if(typeof(funcs[piece]) != 'function') console.error('not a function funcs.'+piece, funcs);
  return funcs[piece](params || {});
}
