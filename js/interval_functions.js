function setIntervalFunction(func, time) {
	if ( isFunctionActive(func) ){
		return;
	}
	var ref = setInterval(func, time);
	setIntervalFunctionReference(func, ref);
}


function clearIntervalFunctions() {
	var ref;
	for (var item in intervalFunctionReferences) {
		ref = intervalFunctionReferences[item];
		clearInterval(ref);
		intervalFunctionReferences[item] = 0;
	}
}

function setIntervalFunctionReference(func, ref) {
	var funcName = func.name;
	intervalFunctionReferences[funcName] = ref;
}

function isFunctionActive(func) {
	var funcName = func.name;
	if (intervalFunctionReferences[funcName] !== undefined) {
		if (intervalFunctionReferences[funcName] > 0) {
			return true;
		}
	}
	return false;
}