"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { EyeOff, Eye } from "lucide-react"

// Password Input Component
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { showPassword: boolean; onTogglePassword: () => void }
>(({ showPassword, onTogglePassword, ...props }, ref) => {
  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        ref={ref}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={onTogglePassword}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </Button>
    </div>
  )
})
PasswordInput.displayName = "PasswordInput"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().optional(),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasPassword, setHasPassword] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      emailNotifications: true,
      smsNotifications: false,
      currentPassword: "",
      newPassword: "",
    },
  })

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/api/user/details')
        if (response.ok) {
          const userData = await response.json()
          form.reset({
            name: userData.name || "",
            email: userData.email || "",
            bio: userData.bio || "",
            emailNotifications: userData.emailNotifications || false,
            smsNotifications: userData.smsNotifications || false,
            currentPassword: "",
            newPassword: "",
          })
          setHasPassword(!!userData.password)
        } else {
          throw new Error('Failed to fetch user details')
        }
      } catch (error) {
        console.error('Error fetching user details:', error)
        toast.error("Failed to load user details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [form])

  async function onSubmit(values: FormValues) {
    try {
      const updateData = { ...values }
      if (hasPassword) {
        delete updateData.currentPassword
      } else if (!updateData.newPassword) {
        delete updateData.currentPassword
        delete updateData.newPassword
      }

      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        await update({
          ...session,
          user: {
            ...session?.user,
            ...updatedUser,
          },
        })
        toast.success("Your settings have been updated successfully.")
        window.location.reload()
        if (values.newPassword) {
          setHasPassword(true)
        }
        form.reset({
          ...values,
          currentPassword: "",
          newPassword: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update settings. Please try again.")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const renderPasswordFields = () => {
    if (!hasPassword) {
      return (
        <>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )
    }
    
    return (
      <FormField
        control={form.control}
        name="newPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Set Password</FormLabel>
            <FormControl>
              <PasswordInput
                {...field}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
            </FormControl>
            <FormDescription>
              Set a password for your account
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="space-y-6 p-6 lg:ml-64">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Profile Settings Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Profile Settings</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notification Preferences Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive emails about your schedule changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">SMS Notifications</FormLabel>
                          <FormDescription>
                            Get text messages for class reminders
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Security</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {renderPasswordFields()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => form.reset()}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}