import { useMutation } from '@tanstack/react-query'
import { request } from '../../../../../config/request'
import type { LoginResponse, LoginT } from '../type/login-type'

export const useLogin = () => {
    return useMutation({
        mutationFn: (data: LoginT) => request.post<LoginResponse>('/admin/signin', data, {
            withCredentials: true
        }).then((res) => res.data)
    })
}
