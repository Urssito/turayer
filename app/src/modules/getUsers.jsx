const getUser = async (userRaw) => {
    const user = userRaw.split('/').pop();
    if(userRaw.split('/').length === 1 || userRaw.split('/').length === 3){
        const res = await fetch('/api/getUser', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'user': user,
            },
        });
        const data = await res.json();
        if(data.errors){
            return data.errors;
        }else{
            return data
        }
    }else{
        return {errors: ['consulta invalida']}
    }
}
export {getUser};