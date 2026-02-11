import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t bg-secondary/30 mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <span className="text-lg font-bold tracking-tighter uppercase bg-black text-white px-2 py-1">
                            RideOrDie
                        </span>
                        <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                            Authentic Ski & Snowboard Lessons based in High1 Resort. <br />
                            We don't teach you how to ski, we teach you how to ride.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Customer Service</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>010-1234-5678</li>
                            <li>Mon-Fri 09:00 - 18:00</li>
                            <li>Sat-Sun Closed</li>
                            <li>support@rideordie.com</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Company Info</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>CEO: Kim Example</li>
                            <li>Reg No: 123-45-67890</li>
                            <li>Address: High1 Resort, Gangwon-do</li>
                            <li>Privacy Policy | Terms of Use</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} RideOrDie. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
