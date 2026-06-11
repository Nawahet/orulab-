import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://viogzzuqzmovleopfish.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MDERNM01VxNshG51FM-NIw_2mmTJ-OQ";
const DEMO_MODE = false;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function dbGetRoom(code) {
  const { data } = await supabase.from("rooms").select("state").eq("code", code).single();
  return data?.state || null;
}
async function dbSaveRoom(code, state) {
  await supabase.from("rooms").upsert({ code, state, updated_at: new Date().toISOString() });
}
async function dbCreateRoom(code, state) {
  await supabase.from("rooms").insert({ code, state, updated_at: new Date().toISOString() });
}

const DILEMMAS = [
  { id: 1, cat: "Loyalty", q: "Your best friend has been cheating on their partner for two years. The partner is someone you also consider a close friend and has no idea.", ctx: "You're at dinner with both of them next Friday. Your friend begs you to say nothing. They claim they're ending the affair next week anyway. You've heard that before." },
  { id: 2, cat: "Loyalty", q: "Your close friend is interviewing for the same job as you. They ask you to look over their application. It's significantly better than yours.", ctx: "You could give feedback that subtly steers them wrong. They'd never know. The job would change your life more than theirs — you genuinely need it more." },
  { id: 3, cat: "Loyalty", q: "Your friend asks you to be their alibi for a night you know they weren't where they claim. You're not sure why they need it.", ctx: "They say it's not what you think. You trust them mostly. But you'd be lying to police if it ever came to that. They've done the same for you once, years ago." },
  { id: 4, cat: "Loyalty", q: "You realise your close friend has been quietly spreading a rumour about you — not maliciously, they believe it's true. It isn't.", ctx: "The rumour reached your workplace. Your friend doesn't know you know. Confronting them would expose the mutual friend who told you. Not confronting them lets it continue." },
  { id: 5, cat: "Loyalty", q: "Your friend is relapsing into an addiction they've hidden from their partner and family. They beg you not to tell anyone and say they have it under control.", ctx: "You've heard this before — three years ago it escalated badly. They're now the parent of a young child. You are the only person who knows." },
  { id: 6, cat: "Honesty", q: "Your closest friend just quit their stable job to pursue a business idea. They ask what you really think of their plan.", ctx: "You've seen the plan. It has serious flaws. They've already handed in their notice. They have a mortgage and a six-month-old baby." },
  { id: 7, cat: "Honesty", q: "You know your friend's partner has been lying about where they go on Tuesday evenings. You don't know why — but it's not what they claim.", ctx: "You've seen them across town three Tuesdays in a row. You have no proof of anything wrong. It could be something entirely innocent." },
  { id: 8, cat: "Honesty", q: "Would you tell a terminally ill loved one an uncomfortable truth if it might cause them distress in their final months?", ctx: "The truth concerns something they always wanted to know. Telling them now changes nothing practical. It might bring peace or it might bring pain." },
  { id: 9, cat: "Honesty", q: "You made a small error at work that nobody noticed. It had no real consequences. Do you confess?", ctx: "Confessing means a difficult conversation with your manager. There's a performance review in three weeks. The error is now fully resolved." },
  { id: 10, cat: "Honesty", q: "A friend asks if you like their new haircut. You find it genuinely unflattering and it's already done.", ctx: "They're about to go on a first date. They seem proud of it. A lie would make them feel confident. The truth would upset them and change nothing." },
  { id: 11, cat: "Life & Death", q: "Your parent is in a vegetative state with no advance directive. Doctors say there is a 2% chance of meaningful recovery.", ctx: "Your sibling wants to keep them alive indefinitely. You don't. The hospital is asking for a decision by end of week. Your parent once said they'd never want to be a vegetable." },
  { id: 12, cat: "Life & Death", q: "A close friend tells you they are seriously considering ending their life. They are not in immediate danger.", ctx: "They are not asking for help. They say they just needed to tell someone. They ask you to keep it secret. They don't seem impulsive — they seem resolved." },
  { id: 13, cat: "Life & Death", q: "Your elderly parent refuses a procedure that would significantly extend their life. They are mentally competent and simply say they're ready to die.", ctx: "The procedure has an 85% success rate and a six-week recovery. Without it, they have around four months. You believe they're deciding this to avoid being a burden." },
  { id: 14, cat: "Life & Death", q: "You are told you have 12 months to live. Treatment could extend your life by 3-5 years but you'd be largely incapacitated for most of it.", ctx: "Your children are 8 and 10. More time means more time with them but most of it in hospitals. Less time means better quality of remaining life but dying sooner." },
  { id: 15, cat: "Life & Death", q: "Is it moral to bring a child into a world you genuinely believe is heading toward catastrophe?", ctx: "You want children deeply. You also believe their generation faces existential risks yours didn't. Your partner disagrees and wants to start a family now." },
  { id: 16, cat: "Justice", q: "You witness a police officer plant evidence on a young man during a stop and search. The officer looks directly at you afterward.", ctx: "You filmed it before they noticed. The officer approaches you and says nothing — just stares. You live in this neighbourhood. The young man is later charged." },
  { id: 17, cat: "Justice", q: "You're on a jury. You believe the defendant is guilty — but the prosecution made a procedural error that should technically result in acquittal.", ctx: "The crime was violent. The victim is in court. Three other jurors are pushing for acquittal on the technicality. You believe letting them go is wrong but the law is clear." },
  { id: 18, cat: "Justice", q: "You know with certainty that someone convicted of a crime is actually innocent. Coming forward would seriously damage your own reputation.", ctx: "The convicted person is serving five years and has a young family. What you'd have to admit is not illegal but would be personally devastating." },
  { id: 19, cat: "Justice", q: "You discover your manager has been falsifying expense reports — small amounts, but consistently over two years.", ctx: "Your manager has championed your career. You're up for a promotion they're sponsoring. HR has an anonymous reporting line but the company is small enough that anonymous might not hold." },
  { id: 20, cat: "Justice", q: "You are an employer and discover that a candidate who lied on their CV is, after six months, your best-performing employee.", ctx: "Nobody else knows. Firing them means losing someone genuinely excellent. Keeping them means rewarding dishonesty. HR policy is unambiguous: termination." },
  { id: 21, cat: "Money", q: "You find a holdall containing a large amount of cash in your local park. No ID, no phone, nothing traceable.", ctx: "You're three months behind on rent and have two kids. The cash appears clean. You ask yourself: who carries that much cash in a holdall and reports it missing?" },
  { id: 22, cat: "Money", q: "A billing error means you've been undercharged by a significant amount over 18 months. The company hasn't noticed.", ctx: "The company is a large corporation. Reporting it means repaying it all at once. You can afford to repay it but it would hurt. The error was entirely their fault." },
  { id: 23, cat: "Money", q: "You are offered a dream job that pays three times your salary — but it's at a company whose ethics you find deeply questionable.", ctx: "You have significant debt. The salary would change your life within three years. A close friend would consider it a personal betrayal." },
  { id: 24, cat: "Money", q: "Is it wrong to buy luxury goods when others are starving?", ctx: "You've worked hard for your money and earned it legally. You give a small amount to charity each month. The luxury item would genuinely make you happy." },
  { id: 25, cat: "Money", q: "You discover your accountant has been saving you money through a grey-area tax arrangement that is probably legal but ethically questionable.", ctx: "You benefit by around 4,000 per year. You didn't ask for this. HMRC has not flagged it. Stopping it means paying more tax than you technically owe." },
  { id: 26, cat: "Relationships", q: "Your partner admits they had a brief emotional affair a year ago — no physical contact — but developed genuine feelings. They ended it and never told you until now.", ctx: "Your relationship has been better than ever this past year. They say telling you now is because they want no secrets. You had no idea anything was wrong." },
  { id: 27, cat: "Relationships", q: "Your long-term partner admits they find one of your close friends deeply attractive and have for years. They haven't acted on it.", ctx: "The three of you regularly spend time together. Your partner says they're not asking for anything — just didn't want the secret. You must now decide if this changes anything." },
  { id: 28, cat: "Relationships", q: "You realise you are no longer in love with your partner but genuinely believe you are the best thing in their life.", ctx: "They have no idea. You've been together four years. They recently turned down a job abroad partly because of you. You could stay and be a good partner — just not a passionate one." },
  { id: 29, cat: "Relationships", q: "Your partner of seven years tells you they're no longer in love with you but wants to stay together for stability.", ctx: "They're not unhappy. They still care for you deeply. They say they may fall back in love — or may not. They'll leave if you want them to. But they're not asking to leave." },
  { id: 30, cat: "Relationships", q: "A close friend group has quietly decided to stop inviting one member to things. Nobody has told them directly. You are the closest to them.", ctx: "The excluded person has become difficult to be around. Nobody wants the confrontation. The person asks you directly if something is wrong." },
  { id: 31, cat: "Family", q: "Your adult child has made a major life decision you consider a serious mistake. They haven't asked for your opinion.", ctx: "It's not dangerous or illegal. It will significantly limit their opportunities in your view. They seem happy. You have one chance to speak before the decision becomes irreversible." },
  { id: 32, cat: "Family", q: "Would you put a parent in a care home if they didn't want to go — but needed care you genuinely cannot provide?", ctx: "They are frightened and upset at the suggestion. You've been their carer for two years and it's affecting your health. The care home is excellent. They would be safe." },
  { id: 33, cat: "Family", q: "Your sibling commits a serious crime. Do you turn them in?", ctx: "The crime harmed someone outside the family. Your sibling is remorseful and says they will turn themselves in within a week. They've said this before and never followed through." },
  { id: 34, cat: "Family", q: "Your parents are divorcing after 35 years. Both are trying to get you to take sides.", ctx: "You love both of them. One is clearly more at fault. They are both asking you to validate their position. Your siblings have chosen sides. You haven't." },
  { id: 35, cat: "Family", q: "Your parent confides they have been deeply unhappy in their marriage for decades — but asks you to say nothing and never bring it up again.", ctx: "You are now unable to look at your family the way you did before. Your other parent seems happy. Nothing will change — they're staying together. You carry this alone now." },
  { id: 36, cat: "Technology", q: "Should AI be allowed to make life-or-death medical decisions if it is proven to be significantly more accurate than human doctors?", ctx: "The AI flags something your doctor says looks fine. The AI has a 0.3% false positive rate. The biopsy is painful and has a small risk of complications. The AI cannot explain its reasoning." },
  { id: 37, cat: "Technology", q: "You discover your teenage child has been using AI to write all of their school essays for six months and is getting top grades.", ctx: "They're engaging with the material — they just can't write well yet. Their school has a strict policy. You know other parents who've turned a blind eye." },
  { id: 38, cat: "Technology", q: "You can install tracking software on your elderly parent's phone to monitor their safety without telling them.", ctx: "They have early-stage dementia and have wandered twice. They've explicitly said they don't want to be monitored. Your sibling thinks it's essential." },
  { id: 39, cat: "Technology", q: "Would you accept a brain chip that made you significantly smarter but subtly changed your personality in ways you'd never be aware of?", ctx: "The people around you would notice the change. You would feel like yourself. The chip cannot be removed. The cognitive enhancement is real and substantial." },
  { id: 40, cat: "Technology", q: "Should social media companies be held legally responsible for content that directly leads to self-harm in young users?", ctx: "The links between certain content and mental health harm are documented but contested. Holding companies responsible could mean the end of open platforms as we know them." },
  { id: 41, cat: "Environment", q: "Is it immoral to have children given climate change?", ctx: "You want children deeply. The carbon cost of a new human life in a wealthy country is measurably significant. Adoption exists. Your partner wants biological children." },
  { id: 42, cat: "Environment", q: "You discover your company has been quietly covering up an environmental violation. Going public would likely close the company and cost 200 people their jobs.", ctx: "The violation is ongoing and causing measurable harm — but slowly. Nobody is dying. You're not senior enough to fix it internally." },
  { id: 43, cat: "Environment", q: "Is flying for leisure morally indefensible in the current climate?", ctx: "You can afford the flight and the offset. The destination matters deeply to you. Your going or not going has a statistically negligible impact on total emissions. You want to go." },
  { id: 44, cat: "Environment", q: "Should meat-eating be made illegal once affordable, nutritionally adequate alternatives exist at scale?", ctx: "Lab-grown meat and plant alternatives exist but are not yet fully mainstream. Billions of animals are slaughtered each year under conditions most people would find disturbing." },
  { id: 45, cat: "Environment", q: "Would you sabotage infrastructure you believe is causing irreversible environmental damage if it was the only way to stop it?", ctx: "Legal routes have been exhausted over five years. The damage is documented and ongoing. Your action would delay the project by at least three years. You would almost certainly be arrested." },
  { id: 46, cat: "Society", q: "You find out a neighbour who has become a close friend is in the country illegally. They have two children born here.", ctx: "They confide in you during a vulnerable moment. Reporting them would almost certainly result in deportation. The children speak no other language." },
  { id: 47, cat: "Society", q: "You're at a dinner party and a guest makes a casually racist comment. Several people laugh nervously.", ctx: "You don't know the guest well. Your host is clearly uncomfortable but says nothing. Two close friends at the table also say nothing." },
  { id: 48, cat: "Society", q: "Should voting be made compulsory?", ctx: "Turnout in most democracies is below 60%. Low-income and young voters are disproportionately absent. Compulsory voting exists in Australia with minimal controversy." },
  { id: 49, cat: "Society", q: "A homeless person you pass every day asks you for money. You suspect they'll spend it on alcohol.", ctx: "It's freezing. They know your name because you've given them food before. You have cash in your pocket. They say they just need a drink to get through tonight." },
  { id: 50, cat: "Society", q: "Is it wrong to live a deliberately ordinary life when you have the intelligence and opportunity to do more?", ctx: "You are by most measures highly capable. You have chosen comfort, stability, and a quiet life. You are happy. Society could theoretically benefit if you applied yourself more ambitiously." },
  { id: 51, cat: "Philosophy", q: "Trolley problem: a runaway trolley will kill five people unless you pull a lever to divert it — diverting it kills one person you've never met.", ctx: "You have three seconds to decide. The five people are elderly. The one person is a 19-year-old student. Nobody will ever know what you chose." },
  { id: 52, cat: "Philosophy", q: "You could push a large stranger off a bridge to stop a trolley killing five people. The physics work. He would die. The five would live.", ctx: "You are the only person present. Nobody will know. The man did nothing wrong. You have two seconds." },
  { id: 53, cat: "Philosophy", q: "You are a doctor. You can save five patients by harvesting organs from one healthy unconsenting person who came in for a routine check-up.", ctx: "The five will die within 24 hours without transplants. No matching donors exist anywhere. The healthy person is young and alone. You are the only doctor present." },
  { id: 54, cat: "Philosophy", q: "If you could go back in time and kill Hitler as a child, would you?", ctx: "You know everything that follows. The child has done nothing wrong yet. You are the only one who knows the future. Your action is certain to prevent the Holocaust." },
  { id: 55, cat: "Philosophy", q: "A doctor must allocate one kidney to either a 70-year-old who will live 10 comfortable years with it, or a 25-year-old who will live 50+ years.", ctx: "Both are equally in need medically. Both have families. The younger person has a history of not following medical advice. The older person has been waiting three years." },
  { id: 56, cat: "Privacy", q: "You have the opportunity to read your teenage child's private messages. You have a genuine concern they may be in danger.", ctx: "They've been withdrawn for six weeks. A friend suggested something is going on. Your child has explicitly said they want their privacy respected." },
  { id: 57, cat: "Privacy", q: "You could read your partner's diary — they left it open by accident. You've had a nagging feeling something has been off for months.", ctx: "The diary is on the table. They're in the shower. You'd never tell them you read it. The nagging feeling might be anxiety — or it might be instinct. You have 30 seconds." },
  { id: 58, cat: "Privacy", q: "Your company has been monitoring all employee communications without clearly disclosing it.", ctx: "It's probably legal under buried terms. Some of your messages are deeply personal. Others could be professionally damaging if misread." },
  { id: 59, cat: "Privacy", q: "Should governments have the right to access encrypted private messages for national security investigations?", ctx: "End-to-end encryption makes certain communications invisible to authorities. Some attacks have been planned via encrypted apps. Backdoors would make all communications theoretically accessible." },
  { id: 60, cat: "Privacy", q: "You accidentally receive an email clearly meant for someone else containing very sensitive personal information about a mutual acquaintance.", ctx: "The sender hasn't noticed their mistake. The information would change how you see the acquaintance significantly. You've already seen the key part." },
  { id: 61, cat: "War", q: "A drone strike can take out a known terrorist leader — but 12 to 15 civilians including children will likely be killed.", ctx: "The target has planned three attacks in the past year. Each was carried out. Another is believed imminent. You are the one who must authorise the strike." },
  { id: 62, cat: "War", q: "You are a soldier ordered to carry out an action you believe is illegal under international law. Your commanding officer insists it's sanctioned.", ctx: "Refusing is a court-martial offence. Complying may constitute a war crime. You have 90 seconds to decide. Three other soldiers are watching you." },
  { id: 63, cat: "War", q: "You are a civilian in an occupied territory. A resistance fighter knocks on your door. You can hide them but if discovered your family will be punished.", ctx: "Your family includes a young child. The penalty for harbouring is severe. Not helping means certain death for the fighter. You have 60 seconds to decide." },
  { id: 64, cat: "War", q: "Is it ever moral to sell weapons to countries with poor human rights records?", ctx: "The purchasing country is an ally with significant strategic value. The weapons are defensive. The deal would support thousands of domestic jobs." },
  { id: 65, cat: "War", q: "Would you support the use of torture if it could with certainty save thousands of innocent lives?", ctx: "The scenario is not hypothetical — it has happened. The person being tortured is known to have the information. The intelligence is confirmed. The lives are real and identifiable." },
  { id: 66, cat: "Health", q: "Should healthcare be rationed based on lifestyle choices — refusing treatment to people whose conditions are self-caused?", ctx: "A smoker needs a lung transplant. The donor organ is scarce. A non-smoker with identical medical need is also waiting. The smoker has quit. You are the committee." },
  { id: 67, cat: "Health", q: "A friend has been self-medicating with an illegal substance that is genuinely helping their mental health and causing no harm to others.", ctx: "They tried the legal route for two years. It didn't work. They've been better for eight months. They've asked you not to interfere. You are the only person who knows." },
  { id: 68, cat: "Health", q: "You are a healthy match for a bone marrow donation that could save a 12-year-old child's life. The procedure is painful with a six-week recovery.", ctx: "You are the only match on the register. The procedure has a very small but real risk to you. Nobody is forcing you. You have 48 hours to decide." },
  { id: 69, cat: "Health", q: "Your friend confides they've been diagnosed with a hereditary condition their adult sibling almost certainly also has — but they refuse to tell their sibling.", ctx: "The sibling is planning to have children. Early diagnosis could prevent passing the condition on. Your friend says it's their medical information to share or not." },
  { id: 70, cat: "Health", q: "Should vaccines be legally mandatory for public school attendance if herd immunity is at stake?", ctx: "Vaccination rates in your area have dropped below the threshold for herd immunity. There have been three outbreaks in two years. Some parents have religious objections." },
  { id: 71, cat: "Hypothetical", q: "You can live to 150 in perfect health — but you will outlive everyone you currently love by decades and cannot choose to die early.", ctx: "You would watch your children, partner, and friends all die. You'd have decades alone at the end. In exchange: fully present, healthy, financially secure throughout." },
  { id: 72, cat: "Hypothetical", q: "You can press a button that guarantees your child has a happy, safe, comfortable — but entirely ordinary — life.", ctx: "The alternative is an unpredictable life that might mean great achievement and real meaning — or it might mean hardship and pain. You must choose before they're born." },
  { id: 73, cat: "Hypothetical", q: "You can erase one painful six-month period from your memory — but some of your most important growth came from that period too.", ctx: "You nominate the window. Everything in it disappears. You would not remember erasing it. Some relationships formed during that time would remain but you'd have no memory of how they started." },
  { id: 74, cat: "Hypothetical", q: "You discover your entire life has been a simulation. You can continue or exit to an unknown reality.", ctx: "Everything you love exists only inside the simulation. What's outside is entirely unknown. It might be nothing. You have 60 seconds to decide." },
  { id: 75, cat: "Hypothetical", q: "You can send one sentence back in time to yourself at age 16.", ctx: "You can warn yourself about a specific event. You can give advice. You can say something emotional. Once sent you can't unsend or add to it. What do you actually write?" },
  { id: 76, cat: "Everyday", q: "You return to your car to find you've scraped a parked vehicle. There are no witnesses.", ctx: "Your dashcam caught the incident. You could delete the footage. Leaving a note means a claim and higher insurance. The other car is a new expensive model." },
  { id: 77, cat: "Everyday", q: "You find a lost dog with no collar or chip. It's clearly well cared for and you've fallen in love with it within an hour.", ctx: "You could take it to a shelter where it may be put down if unclaimed. You could put up posters. Or you could simply keep it. You've always wanted a dog." },
  { id: 78, cat: "Everyday", q: "You're on a packed train and someone becomes increasingly aggressive toward another passenger — not yet violent, but close.", ctx: "Nobody else is acting. The aggressor is twice your size. The potential victim looks terrified. You could intervene, alert the driver, or film it — but not all three." },
  { id: 79, cat: "Everyday", q: "A cashier gives you too much change. You don't notice until you're outside. You go back in — but the cashier who served you has gone on break.", ctx: "You could leave it with another staff member who might pocket it. The original cashier may already be in trouble for the discrepancy. Or you walk away." },
  { id: 80, cat: "Everyday", q: "You see someone on public transport leave their phone on the seat when they get off. You call out — they don't hear. The doors are closing.", ctx: "The phone is unlocked. You could look through it to find a contact. You could hand it to the driver. You could keep it. The train is moving." },
  { id: 81, cat: "Work", q: "Your organisation is heading toward a decision you believe will harm the people you serve. You've been told clearly to stop raising it internally.", ctx: "You have the option to go to the press anonymously. It would likely reverse the decision. It would almost certainly cost you your job if traced. It might not be traced." },
  { id: 82, cat: "Work", q: "Your colleague is clearly being managed out and asks you to support them in an employment tribunal.", ctx: "You've witnessed what they've described. Coming forward puts you in direct conflict with your shared manager. HR has already signalled which side the company is on. You like your job." },
  { id: 83, cat: "Work", q: "You are offered a promotion that involves managing your closest work friend. The power dynamic will fundamentally change your relationship.", ctx: "The salary increase is significant. You've both been at the same level for years. Your friend was also considered for the role but not selected. HR wants your answer today." },
  { id: 84, cat: "Work", q: "You discover a colleague is taking credit for another colleague's work. Both are your friends — one senior to the other.", ctx: "The junior colleague confides in you but begs you not to say anything — they need the senior person's reference. You believe this is wrong. You have a meeting with both of them tomorrow." },
  { id: 85, cat: "Work", q: "Is it wrong to quiet quit — doing the bare minimum while staying employed — if your employer treats you poorly?", ctx: "You've raised the issues formally twice. Nothing changed. You need the salary. Leaving isn't currently an option. You're doing everything in your job description, nothing more." },
  { id: 86, cat: "Faith", q: "Your dying parent asks you to promise you'll raise your children in the faith they raised you in. You have quietly left that faith.", ctx: "Your parent has days to live. The promise would bring them peace. Your partner holds different beliefs and would be upset. Your children are 4 and 7." },
  { id: 87, cat: "Faith", q: "Your child comes to you at age 14 and says they want to leave the family's religion. Your partner considers this a serious moral failure as a parent.", ctx: "Your child is thoughtful and has clearly considered this. You privately have your own doubts about the faith. Your partner is devastated. Your child is asking for your support." },
  { id: 88, cat: "Faith", q: "A close friend from a different culture asks you to participate in a religious ceremony you find morally uncomfortable but that means a great deal to them.", ctx: "Refusing would be a significant slight. Participating feels like a compromise of your values. They've supported you at every major moment in your life." },
  { id: 89, cat: "Faith", q: "Should religious belief excuse someone from a law that applies to everyone else?", ctx: "The law in question prevents a pharmacist from refusing to sell contraception. The pharmacist's faith prohibits it. There is one other pharmacist in the town, 15 miles away." },
  { id: 90, cat: "Faith", q: "Is it wrong to raise children in a religion before they are old enough to consent to it?", ctx: "Religious upbringing shapes identity deeply and may be very hard to leave. It also gives children community, meaning, and moral framework. You were raised in a religion you later left." },
  { id: 91, cat: "Politics", q: "Is civil disobedience ever morally justified against a democratically elected government?", ctx: "The government was fairly elected. The policy in question is legal but deeply unjust in your view. Legal protest has had no effect over three years. The disobedience would be nonviolent." },
  { id: 92, cat: "Politics", q: "Would you vote for a candidate you find personally morally repugnant if you genuinely believed they would govern better?", ctx: "The alternative candidate is personally decent but dangerously incompetent in your view. The election is very close. Your constituency is marginal." },
  { id: 93, cat: "Politics", q: "Should there be a legal cap on individual wealth?", ctx: "The wealthiest individual in your country owns more than the bottom 30% combined. They earned it legally. The cap would require confiscating legally acquired assets above a certain threshold." },
  { id: 94, cat: "Politics", q: "Should ex-prisoners who have served their sentence be allowed to vote?", ctx: "Their sentence was the punishment. Removing voting rights is an additional punishment not specified in the sentencing. Some crimes targeted the democratic process itself." },
  { id: 95, cat: "Politics", q: "You can expose a corrupt politician who will definitely resign — but the leak requires you to break a legally binding NDA.", ctx: "The information is in the public interest. The NDA was signed under pressure. Breaking it exposes you to a significant lawsuit. The politician is currently running for re-election." },
  { id: 96, cat: "Animals", q: "Is eating meat ethically equivalent to causing unnecessary harm — given that alternatives exist?", ctx: "You live in a country with affordable nutritionally complete plant-based alternatives. Meat consumption is a choice not a necessity. The animals experience pain and distress before slaughter." },
  { id: 97, cat: "Animals", q: "Your child's pet is old and suffering. The vet says the kindest option is euthanasia. Your child aged 9 is begging you not to.", ctx: "The pet is in daily pain. It could live another few months in discomfort. You will have to make the final call and explain it to your child." },
  { id: 98, cat: "Animals", q: "You hit a dog with your car on a quiet country road at night. It's alive but badly injured. There's no owner in sight.", ctx: "The nearest vet is 40 minutes away. You're running late for something important. The dog is in visible pain. You have no idea whose it is." },
  { id: 99, cat: "Animals", q: "Is keeping animals in zoos ethical if it demonstrably saves the species from extinction?", ctx: "The animal in question is distressed in captivity. In the wild the species has a life expectancy of three years due to poaching. In the zoo it is safe fed and lives 18 years." },
  { id: 100, cat: "Animals", q: "Would you let your beloved pet die to save a stranger's life if it was the only way?", ctx: "The scenario is real and immediate. Your pet will die if you don't act. The stranger will die if you don't act. You cannot save both. You have 10 seconds." },
  { id: 101, cat: "Identity", q: "Is there a meaningful difference between who you are and who you perform yourself to be in public?", ctx: "You behave differently at work, with your family, with close friends, and alone. Some of these versions feel more real than others. Which one is actually you — and does the question even matter?" },
  { id: 102, cat: "Identity", q: "If a pill could make you happier but also permanently less ambitious, would you take it?", ctx: "Your ambition causes you real suffering. It also drives everything you're proud of. The happier version of you would be content with less. You would not remember what you gave up." },
  { id: 103, cat: "Identity", q: "Are you responsible for the harm caused by your ancestors — and if so, what does that responsibility look like?", ctx: "Your family benefited economically from something that harmed others generations ago. You did nothing wrong. You also benefit indirectly from that history today." },
  { id: 104, cat: "Identity", q: "Is it possible to be genuinely good if you only avoid harmful actions out of fear of consequences rather than moral conviction?", ctx: "You have never stolen, cheated, or hurt anyone. You've also never been in a situation where the risk of getting caught was low enough that you were truly tested." },
  { id: 105, cat: "Identity", q: "Does knowing you will die change how you should live — or does it only matter when you actually feel it?", ctx: "You know intellectually that you will die. Most days this has no effect on your choices. Occasionally it hits you. Those days you live differently. Which version of you is the real one?" },
];

const CATEGORIES = ["All", ...Array.from(new Set(DILEMMAS.map(d => d.cat)))];

const T = {
  bg: "#070709", surface: "#0c0c10", card: "#111116",
  border: "#1c1c24", borderHi: "#2e2e3e",
  chrome: "#c8cdd8", chromeDim: "#6a7080", chromeFaint: "#1a1a22",
  white: "#eef0f4", gold: "#d4af5a", goldDim: "#d4af5a30",
  red: "#e84040", redDim: "#e8404025",
  green: "#3ddc84", greenDim: "#3ddc8425",
  blue: "#4f8ef7", blueDim: "#4f8ef720",
};

const F = {
  display: "'Bebas Neue', 'Arial Narrow', sans-serif",
  body: "'Georgia', serif",
  mono: "'Courier New', monospace",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.white}; font-family: ${F.body}; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.borderHi}; }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 0.4; } 100% { transform: scale(0.95); opacity: 0.8; } }
  @keyframes fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slide-in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(400%); } }
  .chrome-text { background: linear-gradient(135deg, #a8b0c0 0%, #eef0f4 30%, #8090a8 50%, #eef0f4 70%, #a8b0c0 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: shimmer 4s linear infinite; }
  .btn-chrome { background: linear-gradient(180deg, #2a2a36 0%, #16161e 100%); border: 1px solid ${T.borderHi}; color: ${T.chrome}; padding: 14px 28px; font-family: ${F.mono}; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-chrome:hover { border-color: ${T.chrome}; color: ${T.white}; }
  .btn-primary { background: linear-gradient(180deg, #303040 0%, #1e1e2a 100%); border: 1px solid ${T.chrome}; color: ${T.white}; padding: 14px 28px; font-family: ${F.mono}; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-primary:hover { background: linear-gradient(180deg, #3a3a50 0%, #28283a 100%); }
  .input-chrome { background: ${T.surface}; border: 1px solid ${T.border}; color: ${T.white}; padding: 14px 18px; font-family: ${F.mono}; font-size: 16px; outline: none; width: 100%; transition: border-color 0.2s; letter-spacing: 0.1em; }
  .input-chrome:focus { border-color: ${T.borderHi}; }
  .card { background: ${T.card}; border: 1px solid ${T.border}; }
  .animate-in { animation: fade-up 0.4s ease both; }
  .tag { font-family: ${F.mono}; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; padding: 4px 10px; border: 1px solid currentColor; display: inline-block; }
`;

function getRoom(code) { try { const r = localStorage.getItem("oru_" + code); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveRoom(code, state) { try { localStorage.setItem("oru_" + code, JSON.stringify(state)); } catch {} }
function genCode() { return Math.random().toString(36).slice(2, 6).toUpperCase(); }
function genId() { return Math.random().toString(36).slice(2, 10); }

function useRoom(code) {
  const [room, setRoom] = useState(null);
  const roomRef = useRef(null);
  useEffect(() => {
    if (!code) return;
    dbGetRoom(code).then(state => { if (state) { setRoom(state); roomRef.current = state; } });
    const channel = supabase.channel("room:" + code)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: "code=eq." + code }, (payload) => {
        const state = payload.new.state;
        setRoom(state);
        roomRef.current = state;
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [code]);
  const update = useCallback(async (fn) => {
    const current = roomRef.current || await dbGetRoom(code) || {};
    const next = typeof fn === "function" ? fn(current) : { ...current, ...fn };
    roomRef.current = next;
    setRoom({ ...next });
    await dbSaveRoom(code, next);
  }, [code]);
  return [room, update];
}

function ChromeOrb({ size = 80, pulse = false, phase = "idle" }) {
  const colors = { idle: T.chrome, answering: T.blue, reveal: T.gold, hotseat: T.red, results: T.green };
  const c = colors[phase] || T.chrome;
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      {pulse && <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid " + c + "40", animation: "pulse-ring 2.5s ease-in-out infinite" }} />}
      <div style={{ width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, " + c + "cc 0%, " + c + "66 30%, " + c + "22 60%, " + T.bg + " 100%)", border: "1px solid " + c + "80", boxShadow: "0 0 " + (size/2) + "px " + c + "30, inset 0 1px 0 " + c + "60", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)", borderRadius: "50% 50% 0 0" }} />
        <div style={{ position: "absolute", left: "15%", top: 0, width: "12%", height: "100%", background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)", animation: "scan 3s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

function TopBar({ code, round, phase, playerCount }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: T.bg + "f0", borderBottom: "1px solid " + T.border, backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
      <span className="chrome-text" style={{ fontFamily: F.display, fontSize: 20, letterSpacing: "0.15em" }}>ORU</span>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "nowrap", overflow: "hidden" }}>
        {phase && <span className="tag" style={{ color: T.chromeDim, fontSize: 8 }}>{phase}</span>}
        {round > 0 && <span style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim }}>RD {round}</span>}
        {playerCount > 0 && <span style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim }}>{playerCount}p</span>}
        {code && <span style={{ fontFamily: F.mono, fontSize: 12, color: T.gold, letterSpacing: "0.15em" }}>{code}</span>}
      </div>
    </div>
  );
}

function Landing({ onHost, onJoin }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(" + T.border + " 1px, transparent 1px), linear-gradient(90deg, " + T.border + " 1px, transparent 1px)", backgroundSize: "60px 60px", opacity: 0.3, pointerEvents: "none" }} />
        <div style={{ position: "relative", animation: "fade-up 0.6s ease both" }}><ChromeOrb size={72} pulse phase="idle" /></div>
        <h1 className="chrome-text" style={{ fontFamily: F.display, fontSize: "clamp(80px, 20vw, 200px)", letterSpacing: "0.08em", lineHeight: 0.9, margin: "32px 0 0" }}>ORU</h1>
        <p style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: "0.4em", color: T.chromeDim, textTransform: "uppercase", margin: "20px 0 8px" }}>The moral dilemma game</p>
        <p style={{ fontSize: 16, color: T.chromeDim, maxWidth: 480, lineHeight: 1.7, margin: "0 0 48px" }}>Anonymous answers. Blind voting. Then everyone finds out who said what. Two sentences. No right answers.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn-primary" onClick={onHost} style={{ fontSize: 12, padding: "16px 40px" }}>Host a Game</button>
          <button className="btn-chrome" onClick={onJoin} style={{ fontSize: 12, padding: "16px 40px" }}>Join with Code</button>
        </div>
      </div>
      <div style={{ borderTop: "1px solid " + T.border, padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>How it works</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1 }}>
          {[{ n: "01", title: "Host picks a room", body: "One device creates the room. Everyone joins on their own phone with the code." }, { n: "02", title: "Answer anonymously", body: "A dilemma drops. Everyone writes their response in exactly two sentences." }, { n: "03", title: "Vote blind", body: "All answers revealed with no names. Vote for your favourite and least favourite." }, { n: "04", title: "Hot Seat", body: "One player is randomly put in the hot seat to defend their answer to the group." }, { n: "05", title: "Reveal", body: "Names exposed. Points awarded. The real debate begins." }, { n: "06", title: "Repeat", body: "Next round. Different dilemma. Same room. Things get personal." }].map((step, i) => (
            <div key={i} style={{ background: T.card, border: "1px solid " + T.border, padding: "28px 24px" }}>
              <div style={{ fontFamily: F.display, fontSize: 42, color: T.border, lineHeight: 1, marginBottom: 12 }}>{step.n}</div>
              <div style={{ fontFamily: F.mono, fontSize: 11, color: T.chrome, letterSpacing: "0.1em", marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: T.chromeDim, lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid " + T.border, padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 32, textAlign: "center" }}>{DILEMMAS.length}+ dilemmas across {CATEGORIES.length - 1} categories</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {CATEGORIES.slice(1).map((cat) => (<span key={cat} className="tag" style={{ color: T.chromeDim }}>{cat}</span>))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid " + T.border, padding: "80px 24px", maxWidth: 960, margin: "0 auto" }}>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 48, textAlign: "center" }}>Point scoring</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1 }}>
          {[{ pts: "+3", label: "Favourite vote", color: T.gold }, { pts: "+1", label: "Least fav vote", color: T.chrome }, { pts: "+5", label: "Survive hot seat", color: T.red }, { pts: "+2", label: "Hot seat crumbled", color: T.green }].map((p, i) => (
            <div key={i} style={{ background: T.card, border: "1px solid " + T.border, padding: "24px", textAlign: "center" }}>
              <div style={{ fontFamily: F.display, fontSize: 52, color: p.color, lineHeight: 1, marginBottom: 8 }}>{p.pts}</div>
              <div style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>{p.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid " + T.border, padding: "80px 24px", textAlign: "center" }}>
        <h2 className="chrome-text" style={{ fontFamily: F.display, fontSize: "clamp(40px, 10vw, 80px)", letterSpacing: "0.1em", marginBottom: 32 }}>START A GAME</h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onHost} style={{ fontSize: 12, padding: "16px 48px" }}>Host</button>
          <button className="btn-chrome" onClick={onJoin} style={{ fontSize: 12, padding: "16px 48px" }}>Join</button>
        </div>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: T.border, marginTop: 60, letterSpacing: "0.2em" }}>ORU — PLAY ANYWHERE</p>
      </div>
    </div>
  );
}

function HostSetup({ onBack, onCreated }) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("All");
  const [chatMode, setChatMode] = useState("hotseat");
  const chatOptions = [
    { id: "hotseat", label: "Hot Seat only", desc: "Chat opens only during the hot seat round." },
    { id: "always", label: "All rounds", desc: "Chat is open throughout the whole game." },
    { id: "off", label: "Off", desc: "No chat — playing in person or on a call." },
  ];
  const create = async () => {
    if (!name.trim()) return;
    const code = genCode();
    const pid = genId();
    const room = { code, host: pid, phase: "lobby", players: { [pid]: { name: name.trim(), score: 0 } }, settings: { category: cat, chatMode }, round: 0, history: [], answers: {}, votes: {}, hotSeat: null, hotSeatVotes: {}, chat: [] };
    await dbCreateRoom(code, room);
    onCreated({ code, pid });
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 460, width: "100%" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.chromeDim, fontFamily: F.mono, fontSize: 11, letterSpacing: "0.15em", cursor: "pointer", marginBottom: 32, textTransform: "uppercase" }}>Back</button>
        <ChromeOrb size={52} />
        <h2 className="chrome-text" style={{ fontFamily: F.display, fontSize: 42, letterSpacing: "0.1em", margin: "24px 0 32px", textAlign: "center" }}>HOST</h2>
        <div className="card animate-in" style={{ padding: "32px" }}>
          <label style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Your name</label>
          <input className="input-chrome" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" onKeyDown={e => e.key === "Enter" && create()} style={{ marginBottom: 24 }} />
          <label style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Category</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
            {CATEGORIES.map(c => (<button key={c} onClick={() => setCat(c)} style={{ background: cat === c ? T.chromeFaint : "transparent", border: "1px solid " + (cat === c ? T.chrome : T.border), color: cat === c ? T.white : T.chromeDim, padding: "6px 12px", fontFamily: F.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>{c}</button>))}
          </div>
          <label style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", display: "block", marginBottom: 12, textTransform: "uppercase" }}>Text Chat</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {chatOptions.map(opt => (<button key={opt.id} onClick={() => setChatMode(opt.id)} style={{ background: chatMode === opt.id ? T.chromeFaint : "transparent", border: "1px solid " + (chatMode === opt.id ? T.chrome : T.border), color: chatMode === opt.id ? T.white : T.chromeDim, padding: "12px 16px", fontFamily: F.mono, fontSize: 10, letterSpacing: "0.1em", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ textTransform: "uppercase" }}>{opt.label}</span><span style={{ fontSize: 9, color: T.chromeDim }}>{opt.desc}</span></button>))}
          </div>
          <button className="btn-primary" onClick={create} style={{ width: "100%" }}>Create Room</button>
        </div>
      </div>
    </div>
  );
}

function JoinSetup({ onBack, onJoined }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const join = async () => {
    if (!name.trim() || !code.trim()) return;
    const c = code.trim().toUpperCase();
    const room = await dbGetRoom(c);
    if (!room) { setErr("Room not found. Double-check the code."); return; }
    if (room.phase !== "lobby") { setErr("This game has already started."); return; }
    const pid = genId();
    const updated = { ...room, players: { ...room.players, [pid]: { name: name.trim(), score: 0 } } };
    await dbSaveRoom(c, updated);
    onJoined({ code: c, pid });
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: T.chromeDim, fontFamily: F.mono, fontSize: 11, letterSpacing: "0.15em", cursor: "pointer", marginBottom: 32, textTransform: "uppercase" }}>Back</button>
        <ChromeOrb size={52} />
        <h2 className="chrome-text" style={{ fontFamily: F.display, fontSize: 42, letterSpacing: "0.1em", margin: "24px 0 32px", textAlign: "center" }}>JOIN</h2>
        <div className="card animate-in" style={{ padding: "32px" }}>
          <label style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Room Code</label>
          <input className="input-chrome" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="XXXX" maxLength={4} style={{ textAlign: "center", fontSize: 28, letterSpacing: "0.4em", marginBottom: 20 }} />
          <label style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", display: "block", marginBottom: 8, textTransform: "uppercase" }}>Your name</label>
          <input className="input-chrome" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" onKeyDown={e => e.key === "Enter" && join()} style={{ marginBottom: 24 }} />
          {err && <p style={{ fontFamily: F.mono, fontSize: 11, color: T.red, marginBottom: 16 }}>{err}</p>}
          <button className="btn-primary" onClick={join} style={{ width: "100%" }}>Join Room</button>
        </div>
      </div>
    </div>
  );
}

function Lobby({ room, update, pid, isHost }) {
  const players = room.players || {};
  const names = Object.values(players);
  const start = () => {
    const exclude = (room.history || []).map(h => h.id);
    const cat = room.settings?.category || "All";
    const pool = (cat === "All" ? DILEMMAS : DILEMMAS.filter(d => d.cat === cat)).filter(d => !exclude.includes(d.id));
    const q = pool.length ? pool[Math.floor(Math.random() * pool.length)] : DILEMMAS[0];
    update(r => ({ ...r, phase: "answering", question: q, answers: {}, votes: {}, hotSeat: null, hotSeatVotes: {}, round: (r.round || 0) + 1 }));
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px 40px" }}>
      <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
        <ChromeOrb size={64} pulse phase="idle" />
        <h2 className="chrome-text" style={{ fontFamily: F.display, fontSize: 52, letterSpacing: "0.1em", margin: "24px 0 8px" }}>LOBBY</h2>
        <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.3em", marginBottom: 40, textTransform: "uppercase" }}>Room code: <span style={{ color: T.gold, letterSpacing: "0.4em" }}>{room.code}</span></p>
        <div className="card" style={{ padding: "28px", marginBottom: 24 }}>
          <p style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>{names.length} player{names.length !== 1 ? "s" : ""} in room</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {names.map((p, i) => (<div key={i} className="tag" style={{ color: T.chrome }}>{p.name}</div>))}
          </div>
        </div>
        {isHost ? (names.length >= 2 ? <button className="btn-primary" onClick={start} style={{ width: "100%" }}>Start Game</button> : <p style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>Waiting for at least 2 players</p>) : <p style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>Waiting for host to start</p>}
      </div>
    </div>
  );
}

function ChatPanel({ room, update, pid, hotSeatPid }) {
  const [msg, setMsg] = useState("");
  const bottomRef = useRef(null);
  const messages = room.chat || [];
  const players = room.players || {};
  const myName = players[pid]?.name || "You";
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  const send = () => {
    const text = msg.trim();
    if (!text) return;
    update(r => ({ ...r, chat: [...(r.chat || []), { pid, name: myName, text, ts: Date.now(), isHotSeat: pid === hotSeatPid }] }));
    setMsg("");
  };
  return (
    <div style={{ background: T.surface, border: "1px solid " + T.border, display: "flex", flexDirection: "column", height: 320 }}>
      <div style={{ padding: "10px 16px", borderBottom: "1px solid " + T.border, fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase", display: "flex", justifyContent: "space-between" }}>
        <span>Live Chat</span>
        {hotSeatPid && <span style={{ color: T.red }}>{players[hotSeatPid]?.name} on hot seat</span>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.length === 0 && <p style={{ fontFamily: F.mono, fontSize: 10, color: T.border, textAlign: "center", margin: "auto 0" }}>No messages yet.</p>}
        {messages.map((m, i) => {
          const isMe = m.pid === pid;
          const isHS = m.isHotSeat;
          return (
            <div key={i} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%" }}>
              {!isMe && <div style={{ fontFamily: F.mono, fontSize: 9, color: isHS ? T.red : T.chromeDim, letterSpacing: "0.1em", marginBottom: 3 }}>{m.name}{isHS ? " (hot seat)" : ""}</div>}
              <div style={{ background: isMe ? T.chromeFaint : T.card, border: "1px solid " + (isHS ? T.red + "60" : isMe ? T.borderHi : T.border), padding: "8px 12px", fontSize: 13, lineHeight: 1.5, color: T.white }}>{m.text}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: "1px solid " + T.border, display: "flex" }}>
        <input className="input-chrome" value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message" style={{ flex: 1, border: "none", borderRight: "1px solid " + T.border, fontSize: 13, padding: "12px 14px", letterSpacing: "normal" }} />
        <button onClick={send} style={{ background: "transparent", border: "none", color: T.chrome, padding: "12px 18px", cursor: "pointer", fontFamily: F.mono, fontSize: 11 }}>Send</button>
      </div>
    </div>
  );
}

function Answering({ room, update, pid }) {
  const [text, setText] = useState("");
  const q = room.question;
  const answers = room.answers || {};
  const players = room.players || {};
  const hasAnswered = !!answers[pid];
  const total = Object.keys(players).length;
  const submitted = Object.keys(answers).length;
  const showChat = room.settings?.chatMode === "always";
  const submit = () => {
    if (!text.trim()) return;
    update(r => {
      const next = { ...r, answers: { ...(r.answers || {}), [pid]: text.trim() } };
      if (Object.keys(next.answers).length >= Object.keys(next.players || {}).length) {
        const playerCount = Object.keys(next.players || {}).length;
        if (playerCount === 2) {
          const pids = Object.keys(next.answers);
          const prevHotSeat = next.prevHotSeat;
          const hotPid = prevHotSeat ? (pids.find(p => p !== prevHotSeat) || pids[0]) : pids[0];
          next.phase = "hotseat";
          next.hotSeat = hotPid;
          next.prevHotSeat = hotPid;
          next.hotSeatVotes = {};
        } else {
          next.phase = "reveal";
        }
      }
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "72px 16px 40px" }}>
      <div style={{ maxWidth: showChat ? 960 : 680, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, width: "100%" }} className="animate-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <span className="tag" style={{ color: T.chromeDim }}>{q.cat}</span>
            <span style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>{submitted}/{total} answered</span>
          </div>
          <h1 style={{ fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 400, lineHeight: 1.5, color: T.white, marginBottom: 20 }}>{q.q}</h1>
          <div style={{ borderLeft: "2px solid " + T.gold, paddingLeft: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.gold, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Context</div>
            <p style={{ fontSize: 14, color: "#9a9080", lineHeight: 1.7, margin: 0 }}>{q.ctx}</p>
          </div>
          <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "12px 16px", marginBottom: 24, fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.05em" }}>RULE — 2 sentences max. Anonymous until voting.</div>
          {!hasAnswered ? (
            <>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write your answer. Two sentences maximum." rows={5} style={{ background: T.surface, border: "1px solid " + T.border, color: T.white, padding: "16px 18px", fontSize: 15, fontFamily: F.body, lineHeight: 1.7, width: "100%", resize: "vertical", outline: "none" }} />
              <button className="btn-primary" onClick={submit} style={{ width: "100%", marginTop: 12 }}>Submit Answer</button>
            </>
          ) : (
            <div style={{ background: T.blueDim, border: "1px solid " + T.blue + "40", padding: "24px", textAlign: "center" }}>
              <ChromeOrb size={40} pulse phase="answering" />
              <p style={{ fontFamily: F.mono, fontSize: 11, color: T.blue, marginTop: 16, letterSpacing: "0.1em" }}>SUBMITTED — {submitted}/{total} in</p>
            </div>
          )}
        </div>
        {showChat && (
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Chat</div>
            <ChatPanel room={room} update={update} pid={pid} hotSeatPid={null} />
          </div>
        )}
      </div>
    </div>
  );
}

function Reveal({ room, update, pid, isHost }) {
  const answers = room.answers || {};
  const votes = room.votes || {};
  const players = room.players || {};
  const myVote = votes[pid] || {};
  const [fav, setFav] = useState(null);
  const [least, setLeast] = useState(null);
  const hasVoted = !!myVote.fav;
  const totalVoters = Object.keys(players).length;
  const submitted = Object.keys(votes).length;
  const showChat = room.settings?.chatMode === "always";
  const isTwoPlayer = totalVoters === 2;
  const entries = Object.entries(answers).sort((a, b) => a[0].localeCompare(b[0]));

  const getHotSeatPid = (r) => {
    const pids = Object.keys(r.answers || {});
    const prevHotSeat = r.prevHotSeat;
    if (isTwoPlayer && prevHotSeat) {
      return pids.find(p => p !== prevHotSeat) || pids[0];
    }
    return pids[Math.floor(Math.random() * pids.length)];
  };

  const castVote = () => {
    if (!fav || !least || fav === least) { alert("Pick a different answer for each vote."); return; }
    update(r => {
      const next = { ...r, votes: { ...(r.votes || {}), [pid]: { fav, least } } };
      if (Object.keys(next.votes).length >= Object.keys(next.players || {}).length) {
        const hotPid = getHotSeatPid(next);
        next.phase = "hotseat";
        next.hotSeat = hotPid;
        next.prevHotSeat = hotPid;
        next.hotSeatVotes = {};
      }
      return next;
    });
  };

  const skipToHotSeat = () => {
    update(r => {
      const hotPid = getHotSeatPid(r);
      return { ...r, phase: "hotseat", hotSeat: hotPid, prevHotSeat: hotPid, hotSeatVotes: {} };
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "72px 16px 40px" }}>
      <div style={{ maxWidth: showChat ? 960 : 720, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, width: "100%" }} className="animate-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: F.display, fontSize: 36, letterSpacing: "0.1em", color: T.white }}>ANSWERS</h2>
            {!isTwoPlayer && <span style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>{submitted}/{totalVoters} voted</span>}
          </div>
          {isTwoPlayer ? (
            <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "10px 16px", marginBottom: 20, fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.05em" }}>
              2-PLAYER MODE — Read each other's answers. One of you will defend theirs next.
            </div>
          ) : !hasVoted && (
            <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "10px 16px", marginBottom: 20, fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.05em", display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span style={{ color: T.gold }}>STAR = FAV +3</span>
              <span style={{ color: T.red }}>X = LEAST +1</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {entries.map(([apid, answer], i) => {
              const isMe = apid === pid;
              const isFav = fav === apid;
              const isLeast = least === apid;
              return (
                <div key={apid} style={{ background: T.card, border: "1px solid " + (isFav ? T.gold : isLeast ? T.red : T.border), padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.15em" }}>
                      RESPONSE {String(i + 1).padStart(2, "0")}{isMe ? " — YOU" : ""}
                    </span>
                    {!isTwoPlayer && !hasVoted && !isMe && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setFav(isFav ? null : apid)} style={{ background: isFav ? T.gold : "transparent", border: "1px solid " + T.gold, color: isFav ? T.bg : T.gold, padding: "4px 10px", fontFamily: F.mono, fontSize: 9, cursor: "pointer" }}>FAV</button>
                        <button onClick={() => setLeast(isLeast ? null : apid)} style={{ background: isLeast ? T.red : "transparent", border: "1px solid " + T.red, color: isLeast ? T.white : T.red, padding: "4px 10px", fontFamily: F.mono, fontSize: 9, cursor: "pointer" }}>LEAST</button>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: T.white, margin: 0 }}>{answer}</p>
                </div>
              );
            })}
          </div>
          {isTwoPlayer ? (
            isHost ? (
              <button className="btn-primary" onClick={skipToHotSeat} style={{ width: "100%" }}>Go to Hot Seat</button>
            ) : (
              <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "20px", textAlign: "center" }}>
                <p style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>Waiting for host to continue…</p>
              </div>
            )
          ) : !hasVoted ? (
            <button className="btn-primary" onClick={castVote} style={{ width: "100%" }}>Lock In Votes</button>
          ) : (
            <div style={{ background: T.blueDim, border: "1px solid " + T.blue + "40", padding: "20px", textAlign: "center" }}>
              <p style={{ fontFamily: F.mono, fontSize: 11, color: T.blue, letterSpacing: "0.1em" }}>VOTES LOCKED — {submitted}/{totalVoters}</p>
            </div>
          )}
        </div>
        {showChat && (
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Chat</div>
            <ChatPanel room={room} update={update} pid={pid} hotSeatPid={null} />
          </div>
        )}
      </div>
    </div>
  );
}

function HotSeat({ room, update, pid, isHost }) {
  const { hotSeat, answers, players, hotSeatVotes = {}, question } = room;
  const isOnHotSeat = pid === hotSeat;
  const hotPlayer = players?.[hotSeat];
  const myHSVote = hotSeatVotes[pid];
  const totalVoters = Object.keys(players || {}).length - 1;
  const voteCount = Object.values(hotSeatVotes).filter(v => v !== undefined).length;
  const [timer, setTimer] = useState(90);
  const timerRef = useRef(null);
  const showChat = (room.settings?.chatMode || "hotseat") !== "off";
  const votingOpen = room.defenceDone || timer === 0;
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timerRef.current);
  }, []);
  const calcAndAdvance = (hsv) => {
    update(r => {
      const next = { ...r, hotSeatVotes: hsv, phase: "results" };
      const updatedPlayers = { ...next.players };
      Object.values(next.votes || {}).forEach(vote => {
        if (vote.fav && updatedPlayers[vote.fav]) updatedPlayers[vote.fav] = { ...updatedPlayers[vote.fav], score: (updatedPlayers[vote.fav].score || 0) + 3 };
        if (vote.least && updatedPlayers[vote.least]) updatedPlayers[vote.least] = { ...updatedPlayers[vote.least], score: (updatedPlayers[vote.least].score || 0) + 1 };
      });
      const survivedVotes = Object.values(hsv).filter(Boolean).length;
      const voters = Object.keys(next.players || {}).filter(p => p !== next.hotSeat);
      const survived = survivedVotes > voters.length / 2;
      if (next.hotSeat && updatedPlayers[next.hotSeat]) updatedPlayers[next.hotSeat] = { ...updatedPlayers[next.hotSeat], score: (updatedPlayers[next.hotSeat].score || 0) + (survived ? 5 : 2) };
      next.players = updatedPlayers;
      next.history = [...(next.history || []), { id: next.question?.id, survivedHotSeat: survived }];
      return next;
    });
  };
  const voteHotSeat = (survived) => {
    update(r => {
      const newHSV = { ...(r.hotSeatVotes || {}), [pid]: survived };
      const voters = Object.keys(r.players || {}).filter(p => p !== r.hotSeat);
      if (voters.every(p => newHSV[p] !== undefined)) { calcAndAdvance(newHSV); return r; }
      return { ...r, hotSeatVotes: newHSV };
    });
  };
  const skipHotSeat = () => {
    update(r => {
      const next = { ...r, phase: "results", hotSeatSkipped: true };
      const updatedPlayers = { ...next.players };
      Object.values(next.votes || {}).forEach(vote => {
        if (vote.fav && updatedPlayers[vote.fav]) updatedPlayers[vote.fav] = { ...updatedPlayers[vote.fav], score: (updatedPlayers[vote.fav].score || 0) + 3 };
        if (vote.least && updatedPlayers[vote.least]) updatedPlayers[vote.least] = { ...updatedPlayers[vote.least], score: (updatedPlayers[vote.least].score || 0) + 1 };
      });
      next.players = updatedPlayers;
      next.history = [...(next.history || []), { id: next.question?.id, survivedHotSeat: false, skipped: true }];
      return next;
    });
  };
  return (
    <div style={{ minHeight: "100vh", padding: "72px 16px 40px" }}>
      <div style={{ maxWidth: showChat ? 960 : 680, margin: "0 auto", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, width: "100%" }} className="animate-in">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <ChromeOrb size={52} pulse phase="hotseat" />
            <h2 style={{ fontFamily: F.display, fontSize: 44, letterSpacing: "0.1em", color: T.red, margin: "14px 0 4px" }}>HOT SEAT</h2>
            <div style={{ fontFamily: F.mono, fontSize: 16, letterSpacing: "0.2em", color: T.white, marginBottom: 2 }}>{hotPlayer?.name}</div>
            <p style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.15em" }}>is in the hot seat</p>
          </div>
          <div className="card" style={{ padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>The Dilemma</div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>{question?.q}</p>
          </div>
          <div style={{ background: T.redDim, border: "1px solid " + T.red + "40", padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.red, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>{isOnHotSeat ? "Your answer — defend it" : hotPlayer?.name + "'s answer"}</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{answers?.[hotSeat]}</p>
          </div>
          {!votingOpen && <div style={{ textAlign: "center", marginBottom: 16 }}><div style={{ fontFamily: F.display, fontSize: 64, lineHeight: 1, color: timer < 20 ? T.red : T.chromeDim }}>{timer}</div><p style={{ fontFamily: F.mono, fontSize: 9, color: T.border, letterSpacing: "0.15em", marginTop: 4 }}>SECONDS REMAINING</p></div>}
          {isOnHotSeat && !votingOpen && <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "16px", textAlign: "center", marginBottom: 14 }}><p style={{ fontFamily: F.mono, fontSize: 12, color: T.red, marginBottom: 8 }}>Defend your answer.</p><p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, marginBottom: showChat ? 14 : 0 }}>{showChat ? "Type your defence in chat. Tap done when finished." : "Defend out loud. Group votes when time is up."}</p>{showChat && <button className="btn-primary" onClick={() => update(r => ({ ...r, defenceDone: true }))} style={{ marginTop: 4 }}>Done defending</button>}</div>}
          {isOnHotSeat && votingOpen && <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "16px", textAlign: "center" }}><p style={{ fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>Defence time is up. The group is voting...</p></div>}
          {!isOnHotSeat && votingOpen && myHSVote === undefined && (
            <>
              <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, textAlign: "center", marginBottom: 14 }}>Did {hotPlayer?.name} survive the hot seat?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <button className="btn-primary" onClick={() => voteHotSeat(true)} style={{ borderColor: T.green, color: T.green, background: T.greenDim }}>Survived</button>
                <button className="btn-chrome" onClick={() => voteHotSeat(false)} style={{ borderColor: T.red, color: T.red }}>Crumbled</button>
              </div>
            </>
          )}
          {!isOnHotSeat && votingOpen && myHSVote !== undefined && <div style={{ background: T.blueDim, border: "1px solid " + T.blue + "40", padding: "14px", textAlign: "center" }}><p style={{ fontFamily: F.mono, fontSize: 11, color: T.blue }}>Voted — waiting... ({voteCount}/{totalVoters})</p></div>}
          {!isOnHotSeat && !votingOpen && <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "14px", textAlign: "center" }}><p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim }}>{showChat ? "Cross-examine " + hotPlayer?.name + " in chat." : "Listen to " + hotPlayer?.name + "'s defence."} Vote opens when time is up.</p></div>}
          {isHost && <button onClick={skipHotSeat} style={{ background: "transparent", border: "1px solid " + T.border, color: T.chromeDim, fontFamily: F.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", padding: "10px", cursor: "pointer", width: "100%", marginTop: 14 }}>Skip Hot Seat</button>}
        </div>
        {showChat && (
          <div style={{ width: "100%", maxWidth: 400 }}>
            <div style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Chat</div>
            <ChatPanel room={room} update={update} pid={pid} hotSeatPid={hotSeat} />
          </div>
        )}
      </div>
    </div>
  );
}

function Results({ room, update, pid, isHost }) {
  const { answers = {}, votes = {}, players = {}, question, hotSeat, hotSeatVotes = {} } = room;
  const favCounts = {}, leastCounts = {};
  Object.values(votes).forEach(v => {
    if (v.fav) favCounts[v.fav] = (favCounts[v.fav] || 0) + 1;
    if (v.least) leastCounts[v.least] = (leastCounts[v.least] || 0) + 1;
  });
  const hotSeatSurvived = Object.values(hotSeatVotes).filter(Boolean).length > Object.values(hotSeatVotes).length / 2;
  const totalVoters = Object.keys(players).length;
  const isTwoPlayer = totalVoters === 2;
  const ranked = Object.entries(answers).map(([apid, answer]) => ({ pid: apid, answer, name: players[apid]?.name || "Unknown", score: players[apid]?.score || 0, favs: favCounts[apid] || 0, leasts: leastCounts[apid] || 0, isHotSeat: apid === hotSeat })).sort((a, b) => b.favs - a.favs);
  const leaderboard = Object.entries(players).map(([apid, p]) => ({ pid: apid, name: p.name, score: p.score || 0 })).sort((a, b) => b.score - a.score);
  const nextRound = () => {
    const exclude = (room.history || []).map(h => h.id);
    const cat = room.settings?.category || "All";
    const pool = (cat === "All" ? DILEMMAS : DILEMMAS.filter(d => d.cat === cat)).filter(d => !exclude.includes(d.id));
    const q = pool.length ? pool[Math.floor(Math.random() * pool.length)] : DILEMMAS[Math.floor(Math.random() * DILEMMAS.length)];
    update(r => ({ ...r, phase: "answering", question: q, answers: {}, votes: {}, hotSeat: null, hotSeatVotes: {}, defenceDone: false, round: (r.round || 0) + 1 }));
  };
  return (
    <div style={{ minHeight: "100vh", padding: "72px 16px 60px", maxWidth: 720, margin: "0 auto" }}>
      <div className="animate-in">
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <ChromeOrb size={52} phase="results" pulse />
          <h2 style={{ fontFamily: F.display, fontSize: 48, letterSpacing: "0.1em", color: T.white, margin: "16px 0 4px" }}>RESULTS</h2>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.2em", textTransform: "uppercase" }}>Round {room.round}</p>
        </div>
        <div className="card" style={{ padding: "14px 16px", marginBottom: 8, borderLeft: "2px solid " + T.gold }}>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: T.gold, letterSpacing: "0.2em", marginBottom: 6, textTransform: "uppercase" }}>The Dilemma</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 8px" }}>{question?.q}</p>
          <p style={{ fontSize: 13, color: T.chromeDim, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{question?.ctx}</p>
        </div>
        {!room.hotSeatSkipped && <div style={{ background: hotSeatSurvived ? T.greenDim : T.redDim, border: "1px solid " + (hotSeatSurvived ? T.green : T.red) + "40", padding: "14px 16px", marginBottom: 20, textAlign: "center" }}><span style={{ fontFamily: F.mono, fontSize: 11, color: hotSeatSurvived ? T.green : T.red, letterSpacing: "0.1em" }}>HOT SEAT — {players[hotSeat]?.name} {hotSeatSurvived ? "SURVIVED +5" : "CRUMBLED +2"}</span></div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {ranked.map((r, i) => {
            const favPct = totalVoters ? Math.round((r.favs / totalVoters) * 100) : 0;
            return (
              <div key={r.pid} style={{ background: T.card, border: "1px solid " + (i === 0 && !isTwoPlayer ? T.gold : T.border), padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {i === 0 && !isTwoPlayer && <span className="tag" style={{ color: T.gold }}>Most Loved</span>}
                    {r.isHotSeat && <span className="tag" style={{ color: T.red }}>Hot Seat</span>}
                    <span style={{ fontFamily: F.mono, fontSize: 13, color: T.white }}>{r.name}{r.pid === pid ? " (you)" : ""}</span>
                  </div>
                  {!isTwoPlayer && <div style={{ display: "flex", gap: 12, fontFamily: F.mono, fontSize: 11, flexShrink: 0 }}><span style={{ color: T.gold }}>{r.favs} fav</span><span style={{ color: T.red }}>{r.leasts} least</span></div>}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 10px" }}>{r.answer}</p>
                {!isTwoPlayer && <div style={{ height: 2, background: T.border }}><div style={{ height: "100%", width: favPct + "%", background: T.gold, transition: "width 0.8s 0.2s ease" }} /></div>}
              </div>
            );
          })}
        </div>
        <div className="card" style={{ padding: "20px", marginBottom: 24 }}>
          <p style={{ fontFamily: F.mono, fontSize: 10, color: T.chromeDim, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>Leaderboard</p>
          {leaderboard.map((p, i) => (
            <div key={p.pid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < leaderboard.length - 1 ? "1px solid " + T.border : "none" }}>
              <span style={{ fontFamily: F.display, fontSize: 28, color: i === 0 ? T.gold : T.chromeDim, width: 32, lineHeight: 1 }}>{i + 1}</span>
              <span style={{ flex: 1, fontSize: 15 }}>{p.name}{p.pid === pid ? " (you)" : ""}</span>
              <span style={{ fontFamily: F.display, fontSize: 28, color: T.chrome }}>{p.score}</span>
            </div>
          ))}
        </div>
        <div style={{ background: T.chromeFaint, border: "1px solid " + T.border, padding: "18px", marginBottom: 20, textAlign: "center" }}>
          <p style={{ fontFamily: F.mono, fontSize: 9, color: T.chromeDim, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>Discuss</p>
          <p style={{ fontSize: 13, color: T.chromeDim, lineHeight: 1.6, margin: 0 }}>Does anyone want to change their answer now? Who surprised you? What would you do differently?</p>
        </div>
        {isHost ? <button className="btn-primary" onClick={nextRound} style={{ width: "100%" }}>Next Dilemma</button> : <p style={{ textAlign: "center", fontFamily: F.mono, fontSize: 11, color: T.chromeDim }}>Host will move to next round.</p>}
      </div>
    </div>
  );
}

function Game({ code, pid }) {
  const [room, update] = useRoom(code);
  if (!room) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ fontFamily: F.mono, color: T.chromeDim }}>Loading room...</p></div>;
  const isHost = room.host === pid;
  const phase = room.phase;
  const players = room.players || {};
  const phaseProps = { room, update, pid, isHost };
  return (
    <>
      <TopBar code={code} round={room.round} phase={phase} playerCount={Object.keys(players).length} />
      {phase === "lobby" && <Lobby {...phaseProps} />}
      {phase === "answering" && <Answering {...phaseProps} />}
      {phase === "reveal" && <Reveal {...phaseProps} />}
      {phase === "hotseat" && <HotSeat {...phaseProps} />}
      {phase === "results" && <Results {...phaseProps} />}
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [session, setSession] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.white, fontFamily: F.body }}>
      <style>{css}</style>
      {screen === "landing" && <Landing onHost={() => setScreen("host")} onJoin={() => setScreen("join")} />}
      {screen === "host" && <HostSetup onBack={() => setScreen("landing")} onCreated={(s) => { setSession(s); setScreen("game"); }} />}
      {screen === "join" && <JoinSetup onBack={() => setScreen("landing")} onJoined={(s) => { setSession(s); setScreen("game"); }} />}
      {screen === "game" && session && <Game code={session.code} pid={session.pid} />}
    </div>
  );
}

