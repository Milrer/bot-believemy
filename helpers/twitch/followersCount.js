export async function getUserId(username, token) {
    try {
        const response = await fetch(
            `https://api.twitch.tv/helix/users?login=${username}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Client-Id': process.env.CLIENT_ID_TWITCH,
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                return data.data[0].id;
            }
        }

        return null;
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'ID d'utilisateur Twitch:",
            error
        );
        return null;
    }
}

export async function getFollowersCount(userId, token) {
    try {
        const response = await fetch(
            `https://api.twitch.tv/helix/users/follows?to_id=${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Client-Id': process.env.CLIENT_ID_TWITCH,
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.total) {
                return data.total;
            }
        }

        return 0;
    } catch (error) {
        console.error(
            'Erreur lors de la récupération du nombre de followers Twitch:',
            error
        );
        return 0;
    }
}
