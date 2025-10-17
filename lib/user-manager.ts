// User ID management with cookies
import { v4 as uuidv4 } from 'uuid'

const USER_ID_COOKIE = 'mutumwa_user_id'

export class UserManager {
    // Get or create user ID from cookies
    static getUserId(): string {
        if (typeof window === 'undefined') return ''

        // Check if user ID exists in cookies
        const cookies = document.cookie.split(';')
        const userIdCookie = cookies.find(cookie =>
            cookie.trim().startsWith(`${USER_ID_COOKIE}=`)
        )

        if (userIdCookie) {
            const userId = userIdCookie.split('=')[1]
            return userId
        }

        // Generate new user ID if not found
        const newUserId = uuidv4()
        this.setUserId(newUserId)
        return newUserId
    }

    // Set user ID in cookies (expires in 10 years)
    static setUserId(userId: string): void {
        if (typeof window === 'undefined') return

        const expiryDate = new Date()
        expiryDate.setFullYear(expiryDate.getFullYear() + 10)

        document.cookie = `${USER_ID_COOKIE}=${userId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`
    }

    // Clear user ID (for testing or logout)
    static clearUserId(): void {
        if (typeof window === 'undefined') return

        document.cookie = `${USER_ID_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
}
