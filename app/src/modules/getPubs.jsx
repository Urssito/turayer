const getPubs = async (pub) => {
    const res = await fetch('/api/getPubs', {
        mehtod: 'GET',
        headers: {
            'content-type': 'application/json',
            'pub': pub
        }
    });
    const data = await res.json();
    return data;
}

export {getPubs};