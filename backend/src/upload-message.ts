export const handler = async (event: any) => {
    console.log(event);
    try {
        const res = "";
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "",
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "some error happened",
            }),
        };
    }
};
