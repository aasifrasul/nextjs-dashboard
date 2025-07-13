import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User, CreateUserData, UpdateUserData } from '../users/types';

export const usersApi = createApi({
	reducerPath: 'usersApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/users',
		prepareHeaders: (headers, { getState }) => {
			const token = (getState() as any).auth?.token;
			if (token) {
				headers.set('authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['User'],
	endpoints: (builder) => ({
		// Get all users
		getUsers: builder.query<User[], void>({
			query: () => '',
			providesTags: (result) =>
				result
					? [
							...result.map(({ id }) => ({ type: 'User' as const, id })),
							{ type: 'User', id: 'LIST' },
						]
					: [{ type: 'User', id: 'LIST' }],
			transformResponse: (response: any) => {
				return response.data || response;
			},
		}),

		// Get single user
		getUser: builder.query<User, string>({
			query: (id) => `/${id}`,
			providesTags: (result, error, id) => [{ type: 'User', id }],
		}),

		// Create user
		createUser: builder.mutation<User, CreateUserData>({
			query: (newUser) => ({
				url: '',
				method: 'POST',
				body: newUser,
			}),
			invalidatesTags: [{ type: 'User', id: 'LIST' }],
		}),

		// Update user
		updateUser: builder.mutation<User, { id: string; updates: UpdateUserData }>({
			query: ({ id, updates }) => ({
				url: `/${id}`,
				method: 'PATCH',
				body: updates,
			}),
			invalidatesTags: (result, error, { id }) => [
				{ type: 'User', id },
				{ type: 'User', id: 'LIST' },
			],
		}),

		// Delete user
		deleteUser: builder.mutation<void, string>({
			query: (id) => ({
				url: `/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'User', id },
				{ type: 'User', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetUsersQuery,
	useGetUserQuery,
	useCreateUserMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = usersApi;
