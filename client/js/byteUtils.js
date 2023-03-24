var byteUtils = {};

byteUtils.numToBytes = function (num, byteCount = 4, arr) {
    let bytes = [];
    let x = num;
    for (let i = byteCount - 1; i >= 0; i--) {
        const byte = x & 0xff;
        bytes[i] = byte;
        x = Math.floor(x / 0x100);
    }

    if (!arr) return bytes;

    arr = arr.concat(bytes);
    return arr;
};

byteUtils.bytesToNum = function (arr, byteCount = 4, offset = 0) {
    let num = 0;
    for (let i = 0; i < byteCount; i++) {
        const byte = arr[i + offset];
        num *= 0x100;
        num += byte;
    }
    return num;
};

byteUtils.test = function () {
    let nums = [13, 84567, 3485, 56, 2, 5439];
    let byteCounts = [1, 4, 2, 1, 1, 2];

    console.log("Initial nums:");
    console.log(nums);

    let arr = [];
    for (let i = 0; i < nums.length; i++) {
        arr = byteUtils.numToBytes(nums[i], byteCounts[i], arr);
    }

    console.log("Byte array:");
    console.log(arr);

    let convertedNums = [];
    let offset = 0;
    for (let i = 0; i < nums.length; i++) {
        let num = byteUtils.bytesToNum(arr, byteCounts[i], offset);
        offset += byteCounts[i];
        convertedNums.push(num);
    }

    console.log("Converted nums:");
    console.log(convertedNums);
};
