
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DMCA Policy | Komida',
    description: 'DMCA Copyright Policy and Takedown Procedure for Komida.',
    alternates: {
        canonical: 'https://komida.site/dmca',
    },
};

export default function DmcaPage() {
    return (
        <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">DMCA Copyright Policy</h1>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                    <strong>Komida</strong> respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, the text of which may be found on the U.S. Copyright Office website at <a href="http://www.copyright.gov/legislation/dmca.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">http://www.copyright.gov/legislation/dmca.pdf</a>, Komida will respond expeditiously to claims of copyright infringement committed using the Komida service and/or the Komida website (the &quot;Site&quot;) if such claims are reported to Komida&#39;s Designated Copyright Agent identified in the sample notice below.
                </p>

                <p>
                    If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to Komida&#39;s Designated Copyright Agent. Upon receipt of Notice as described below, Komida will take whatever action, in its sole discretion, it deems appropriate, including removal of the challenged content from the Site.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4 text-foreground">DMCA Notice of Alleged Infringement (&quot;Notice&quot;)</h2>

                <ol className="list-decimal pl-6 space-y-4">
                    <li>
                        <strong>Identify the copyrighted work</strong> that you claim has been infringed, or - if multiple copyrighted works are covered by this Notice - you may provide a representative list of the copyrighted works that you claim have been infringed.
                    </li>
                    <li>
                        <strong>Identify the material or link</strong> you claim is infringing (or the subject of infringing activity) and that access to which is to be disabled, including at a minimum, if applicable, the URL of the link shown on the Site where such material may be found.
                    </li>
                    <li>
                        <strong>Provide your mailing address, telephone number, and, if available, email address.</strong>
                    </li>
                    <li>
                        <strong>Include both of the following statements in the body of the Notice:</strong>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>&quot;I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use).&quot;</li>
                            <li>&quot;I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed.&quot;</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Provide your full legal name and your electronic or physical signature.</strong>
                    </li>
                </ol>

                <p className="mt-8">
                    Deliver this Notice, with all items completed, to Komida&#39;s Designated Copyright Agent:
                </p>

                <div className="bg-muted p-6 rounded-lg border border-border mt-4">
                    <p className="font-semibold text-foreground">Copyright Agent</p>
                    <p>Komida Legal Team</p>
                    <p>Email: <a href="mailto:dmca@komida.site" className="text-primary hover:underline">dmca@komida.site</a></p>
                </div>

                <p className="text-sm mt-8 italic border-t border-border pt-4">
                    Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability.
                </p>
            </div>
        </div>
    );
}
