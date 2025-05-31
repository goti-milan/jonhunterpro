import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Briefcase, BookmarkIcon, Building, LogOut, Brain, FileText, BarChart3 } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleSignOut = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">JobConnect</h1>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Find Jobs
                  </a>
                </Link>
                {isAuthenticated && (
                  <>
                    <Link href="/ai-builder">
                      <a className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <Brain className="h-4 w-4 mr-1" />
                        AI Builder
                      </a>
                    </Link>
                    <Link href="/ats-analyzer">
                      <a className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        ATS Analyzer
                      </a>
                    </Link>
                  </>
                )}
                <a href="#" className="text-slate-600 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Company Reviews
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/post-job">
                  <Button variant="ghost" className="text-slate-600 hover:text-primary font-medium">
                    Post a Job
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <BookmarkIcon className="mr-2 h-4 w-4" />
                      Saved Jobs
                    </DropdownMenuItem>
                    {user?.userType === 'employer' && (
                      <DropdownMenuItem className="cursor-pointer">
                        <Building className="mr-2 h-4 w-4" />
                        My Companies
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <a href="#" className="text-slate-600 hover:text-primary font-medium">
                  Post a Job
                </a>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-primary text-white hover:bg-secondary"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  variant="outline"
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
