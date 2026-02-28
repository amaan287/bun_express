export const statusCode={
    internServer:500,
    notFound:404,
    defaultSucess:200,
    defaultRedirect:302
}
export const portRange={
    minimumPort:0,
    maximumPort:65535,
    defaultPort:3000
}
export const errorMessage={
    internalServer:"Internal Server error",
    notFound :"Not found",
    noResponseError:"No response sent",
    duplicateResponse :"Response already sent",
    portRangeExceed:"Port must be an integer between 0 and 65535"
}
export const methods={
    get:"GET",
    post:"POST",
    put:"PUT",
    delete:"DELETE"
}
