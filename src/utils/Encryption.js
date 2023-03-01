export function Encryption () {

    const xorStrings = (key, input)=>{
        var output = '';
        for (var i = 0; i < input.length; i++) {
            var c = input.charCodeAt(i);
            var k = key.charCodeAt(i % key.length);
            output += String.fromCharCode(c ^ k);
        }
        return output;
    }
    
    const encode = (key, data)=>{
        return Buffer.from(xorStrings(key, data), 'utf8').toString('base64');
    }
    
    const decode = (key, data)=>{
        return xorStrings(key, Buffer.from(data, 'base64').toString('utf8'));
    }
    

    return {
        encode,
        decode
    }
}
 