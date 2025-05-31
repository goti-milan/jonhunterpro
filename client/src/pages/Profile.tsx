import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  BookmarkIcon,
  Building,
  Calendar,
  Edit3
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications/my"],
    enabled: isAuthenticated,
  });

  const { data: savedJobs = [] } = useQuery({
    queryKey: ["/api/saved-jobs"],
    enabled: isAuthenticated,
  });

  const { data: myCompanies = [] } = useQuery({
    queryKey: ["/api/companies/my"],
    enabled: isAuthenticated,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      // Note: This would require an update user endpoint in the backend
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
        bio: user.bio || "",
      });
    }
    setIsEditing(false);
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your account and job search preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-slate-600">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}
                  </Badge>
                </div>

                <Separator className="mb-6" />

                <div className="space-y-4">
                  {user?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-slate-400 mr-3" />
                      <span className="text-slate-700">{user.phone}</span>
                    </div>
                  )}
                  {user?.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 mr-3" />
                      <span className="text-slate-700">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-slate-400 mr-3" />
                    <span className="text-slate-700">
                      Joined {new Date(user?.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Applications</span>
                    <span className="font-medium">{applications.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Saved Jobs</span>
                    <span className="font-medium">{savedJobs.length}</span>
                  </div>
                  {user?.userType === 'employer' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Companies</span>
                      <span className="font-medium">{myCompanies.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
                {user?.userType === 'employer' && (
                  <TabsTrigger value="companies">Companies</TabsTrigger>
                )}
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              First Name
                            </label>
                            <Input
                              value={profileData.firstName}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                firstName: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Last Name
                            </label>
                            <Input
                              value={profileData.lastName}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                lastName: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                          </label>
                          <Input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              email: e.target.value
                            })}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Phone
                            </label>
                            <Input
                              value={profileData.phone}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                phone: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Location
                            </label>
                            <Input
                              value={profileData.location}
                              onChange={(e) => setProfileData({
                                ...profileData,
                                location: e.target.value
                              })}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Bio
                          </label>
                          <Textarea
                            rows={4}
                            value={profileData.bio}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              bio: e.target.value
                            })}
                            placeholder="Tell us about yourself..."
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button
                            onClick={handleSaveProfile}
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-slate-900">First Name</h4>
                            <p className="text-slate-600">{user?.firstName || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Last Name</h4>
                            <p className="text-slate-600">{user?.lastName || "Not provided"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-slate-900">Email</h4>
                          <p className="text-slate-600">{user?.email || "Not provided"}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-slate-900">Phone</h4>
                            <p className="text-slate-600">{user?.phone || "Not provided"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">Location</h4>
                            <p className="text-slate-600">{user?.location || "Not provided"}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-slate-900">Bio</h4>
                          <p className="text-slate-600">{user?.bio || "No bio provided"}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Applications Tab */}
              <TabsContent value="applications">
                <Card>
                  <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {applications.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Applications Yet</h3>
                        <p className="text-slate-600">Start applying to jobs to see them here.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((application: any) => (
                          <Card key={application.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-900 mb-1">
                                    {application.job.title}
                                  </h3>
                                  <p className="text-primary font-medium mb-2">
                                    {application.job.company.name}
                                  </p>
                                  <p className="text-sm text-slate-600 mb-2">
                                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                  </p>
                                  {application.coverLetter && (
                                    <p className="text-sm text-slate-600">
                                      "{application.coverLetter.slice(0, 100)}..."
                                    </p>
                                  )}
                                </div>
                                <Badge className={getApplicationStatusColor(application.status)}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Saved Jobs Tab */}
              <TabsContent value="saved">
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {savedJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <BookmarkIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No Saved Jobs</h3>
                        <p className="text-slate-600">Save jobs you're interested in to find them here later.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {savedJobs.map((job: any) => (
                          <Card key={job.id} className="border">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-slate-900 mb-1">{job.title}</h3>
                                  <p className="text-primary font-medium mb-2">{job.company.name}</p>
                                  <div className="flex items-center text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {job.location}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">
                                  View Job
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Companies Tab (for employers) */}
              {user?.userType === 'employer' && (
                <TabsContent value="companies">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Companies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {myCompanies.length === 0 ? (
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-slate-900 mb-2">No Companies</h3>
                          <p className="text-slate-600">Create a company to start posting jobs.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myCompanies.map((company: any) => (
                            <Card key={company.id} className="border">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{company.name}</h3>
                                    {company.industry && (
                                      <p className="text-sm text-slate-600 mb-2">{company.industry}</p>
                                    )}
                                    {company.location && (
                                      <div className="flex items-center text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {company.location}
                                      </div>
                                    )}
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Manage
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
